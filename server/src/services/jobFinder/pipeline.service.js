const User = require("../../models/User");
const JobSearchPreference = require("../../models/JobSearchPreference");
const JobSearchRun = require("../../models/JobSearchRun");
const ExternalJob = require("../../models/ExternalJob");
const JobRecommendation = require("../../models/JobRecommendation");
const ApiError = require("../../utils/ApiError");

const { fetchAllATS } = require("./ats");
const { applyAllFilters } = require("./filter.service");
const { deduplicateJobs, excludeAlreadySeen } = require("./dedup.service");
const { buildCandidateProfile, scoreJobDeterministic, scoreJobsWithAI, calculateHybridScore } = require("./matcher.service");
const { generateApplicationKit } = require("./applicationKit.service");

const runJobSearchPipeline = async (candidateId) => {
    let run;
    try {
        console.log(`[JobFinder] Starting pipeline for candidate ${candidateId}`);
        
        // 1. Load user with profile
        const user = await User.findById(candidateId);
        if (!user) throw new ApiError(404, "User not found");

        // 2. Load preferences
        let preferences = await JobSearchPreference.findOne({ candidate: candidateId });
        if (!preferences) {
            preferences = await JobSearchPreference.create({
                candidate: candidateId,
                targetTitles: [],
                locations: [],
                allowRemote: true,
                employmentTypes: [],
                experienceMin: 0,
                experienceMax: 5,
                excludedTitles: [],
                enabled: true
            });
        }

        console.log(`[JobFinder] Preferences: titles=${JSON.stringify(preferences.targetTitles)}, locations=${JSON.stringify(preferences.locations)}, remote=${preferences.allowRemote}, exp=${preferences.experienceMin}-${preferences.experienceMax}`);

        // 3. Create run record
        run = await JobSearchRun.create({
            candidate: candidateId,
            status: 'RUNNING',
            startedAt: new Date()
        });

        // Build stats object to track counts through the pipeline
        const stats = {
            fetched: 0,
            afterFilters: 0,
            afterDeduplication: 0,
            novel: 0,
            scored: 0,
            recommended: 0,
            atsErrors: []
        };

        // 4. Fetch ATS
        const { jobs: rawJobs, errors: atsErrors } = await fetchAllATS();
        stats.fetched = rawJobs.length;
        run.scanned = rawJobs.length;
        if (atsErrors && atsErrors.length > 0) {
            run.errors = atsErrors;
            stats.atsErrors = atsErrors.map(e => `${e.source}: ${e.message}`);
        }

        // 5. Apply Filters (filter.service now logs per-stage counts)
        console.log(`[JobFinder] Fetched ${rawJobs.length} raw jobs, applying filters...`);
        const filteredJobs = applyAllFilters(rawJobs, preferences);
        stats.afterFilters = filteredJobs.length;
        run.filtered = rawJobs.length - filteredJobs.length;
        console.log(`[JobFinder] ${filteredJobs.length} jobs passed filters`);

        // 6. Deduplicate
        const dedupedJobs = deduplicateJobs(filteredJobs);
        stats.afterDeduplication = dedupedJobs.length;
        console.log(`[JobFinder] ${dedupedJobs.length} jobs after deduplication`);

        // 7. Exclude seen
        const novelJobs = await excludeAlreadySeen(dedupedJobs, candidateId);
        stats.novel = novelJobs.length;
        console.log(`[JobFinder] ${novelJobs.length} novel jobs after excluding seen`);

        // 8. Upsert ExternalJobs
        const savedExternalJobs = [];
        for (const job of novelJobs) {
            const updatedJob = await ExternalJob.findOneAndUpdate(
                { normalizedId: job.normalizedId },
                { $set: job },
                { upsert: true, new: true }
            );
            savedExternalJobs.push(updatedJob);
        }
        
        // 9. Update run.newJobs
        run.newJobs = savedExternalJobs.length;

        if (savedExternalJobs.length === 0) {
            run.status = 'COMPLETED';
            run.completedAt = new Date();
            await run.save();
            console.log(`[JobFinder] Pipeline completed — no novel jobs to score`);
            return { run, recommendations: [], stats };
        }

        // 10. Candidate Profile
        const profile = await buildCandidateProfile(user);

        // 11. Score deterministic
        const scoredJobs = savedExternalJobs.map(job => {
            return {
                job,
                deterministicScore: scoreJobDeterministic(job, profile)
            };
        });

        // 12. Top 100 deterministic
        scoredJobs.sort((a, b) => b.deterministicScore - a.deterministicScore);
        const top100 = scoredJobs.slice(0, 100);
        stats.scored = top100.length;
        
        // 13. Score with AI
        console.log(`[JobFinder] AI scoring top ${top100.length} jobs...`);
        const aiResults = await scoreJobsWithAI(top100.map(s => s.job), profile, 5);

        // 14. Hybrid Score
        const finalScores = aiResults.map((aiRes, idx) => {
            const detScore = top100[idx].deterministicScore;
            const hybrid = calculateHybridScore(detScore, aiRes.aiScore);
            return {
                ...aiRes,
                deterministicScore: detScore,
                hybridScore: hybrid
            };
        });

        // 15. Sort by hybrid descending
        finalScores.sort((a, b) => b.hybridScore - a.hybridScore);

        // 16. Top 20
        const top20 = finalScores.slice(0, 20);

        // 17. Create Recommendations
        const recommendations = [];
        let i = 0;
        for (const item of top20) {
            const rec = new JobRecommendation({
                candidate: candidateId,
                externalJob: item.job._id,
                searchRun: run._id,
                matchScore: item.hybridScore,
                deterministicScore: item.deterministicScore,
                aiScore: item.aiScore,
                matchingSkills: item.matchingSkills,
                missingSkills: item.missingSkills,
                reasons: [item.summary],
                aiSummary: item.summary,
                recommendation: item.recommendation,
                evidence: item.evidence,
                concerns: item.concerns,
                status: 'NEW'
            });

            // 18. Auto-generate app kit for top 5
            if (i < 5) {
                console.log(`[JobFinder] Generating Application Kit for top job ${i+1}`);
                try {
                    const kit = await generateApplicationKit(item.job, profile, rec);
                    rec.coverLetter = kit.coverNote;
                    rec.applicationAnswers = kit.applicationAnswers;
                    rec.kitGeneratedAt = new Date();
                } catch (kitError) {
                    console.warn(`[JobFinder] Application kit generation failed for job ${i+1}:`, kitError.message);
                    rec.coverLetter = 'Failed to generate cover note.';
                    rec.kitGeneratedAt = new Date();
                }
            }
            
            await rec.save();
            recommendations.push(rec);
            i++;
        }

        stats.recommended = recommendations.length;

        // 19. Final run stats
        run.matched = finalScores.length;
        run.recommended = recommendations.length;
        if (atsErrors && atsErrors.length > 0) {
            run.status = 'PARTIAL';
        } else {
            run.status = 'COMPLETED';
        }
        run.completedAt = new Date();
        await run.save();

        console.log(`[JobFinder] Pipeline completed successfully for candidate ${candidateId}`);
        console.log(`[JobFinder] Stats: fetched=${stats.fetched} → filtered=${stats.afterFilters} → deduped=${stats.afterDeduplication} → novel=${stats.novel} → scored=${stats.scored} → recommended=${stats.recommended}`);
        
        // 20. Return
        return { run, recommendations, stats };

    } catch (error) {
        console.error('[JobFinder] Pipeline failed:', error.message);
        if (run) {
            run.status = run.status === 'PARTIAL' ? 'PARTIAL' : 'FAILED';
            run.errors = run.errors || [];
            run.errors.push({ source: 'pipeline', message: error.message, timestamp: new Date() });
            run.completedAt = new Date();
            await run.save();
        }
        throw error;
    }
};

module.exports = { runJobSearchPipeline };
