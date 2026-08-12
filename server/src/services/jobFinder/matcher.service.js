const { ai, GEMINI_MODEL } = require("../../config/gemini");
const { downloadResume } = require("../../utils/downloadResume");
const { extractText } = require("../../utils/pdfParser");

const buildCandidateProfile = async (user) => {
    let resumeText = '';
    if (user.profile?.resume?.url) {
        try {
            const buffer = await downloadResume(user.profile.resume.url);
            resumeText = await extractText(buffer);
        } catch (error) {
            console.warn(`[JobFinder] Failed to extract resume for ${user._id}:`, error.message);
        }
    }

    return {
        name: user.name,
        skills: user.profile?.skills || [],
        experience: user.profile?.experience || [],
        education: user.profile?.education || [],
        location: user.profile?.location,
        currentPosition: user.profile?.currentPosition,
        currentCompany: user.profile?.currentCompany,
        bio: user.profile?.bio,
        resumeText
    };
};

const scoreJobDeterministic = (job, candidateProfile) => {
    let score = 0;
    
    const jobTitle = (job.title || '').toLowerCase();
    const pos = (candidateProfile.currentPosition || '').toLowerCase();
    
    // Target title relevance
    if (pos && jobTitle.includes(pos)) {
        score += 30;
    }

    // Skills
    const jobSkillsStr = Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || '');
    const jobSkills = jobSkillsStr.toLowerCase();
    let matchedSkills = 0;
    const skillsList = candidateProfile.skills || [];
    for (const skill of skillsList) {
        if (jobSkills.includes(skill.toLowerCase())) {
            matchedSkills++;
        }
    }
    
    if (skillsList.length > 0) {
        score += Math.min(40, (matchedSkills / skillsList.length) * 40);
    } else {
        score += 20; 
    }

    // Location
    if (job.remote || (job.location && candidateProfile.location && job.location.toLowerCase().includes(candidateProfile.location.toLowerCase()))) {
        score += 15;
    }

    // Freshness
    if (job.postedAt) {
        const days = (new Date() - new Date(job.postedAt)) / (1000 * 60 * 60 * 24);
        if (days <= 7) score += 15;
        else if (days <= 14) score += 10;
        else if (days <= 30) score += 5;
    }

    return Math.min(100, Math.round(score));
};

const scoreJobsWithAI = async (jobs, candidateProfile, batchSize = 5) => {
    const results = [];
    
    for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        console.log(`[JobFinder] AI scoring batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(jobs.length / batchSize)}`);

        const prompt = `
            CRITICAL: Do NOT invent or assume candidate skills. If something is not found in the resume, say 'Not found in candidate profile'.
            Evaluate the following candidate against ${batch.length} jobs. 
            Candidate Profile:
            ${JSON.stringify(candidateProfile)}
            
            Jobs:
            ${batch.map((j, idx) => `JobIndex ${idx}: ${j.title} at ${j.company}\nDescription: ${j.description ? j.description.substring(0, 1000) : ''}...`).join('\n\n')}

            Respond with a JSON array ONLY:
            [{
                "jobIndex": <integer index from prompt>,
                "score": <0-100 integer>,
                "summary": "<brief text>",
                "matchingSkills": ["skill1"],
                "missingSkills": ["skill2"],
                "evidence": ["evidence1"],
                "concerns": ["concern1"],
                "recommendation": "<HIGH_PRIORITY|GOOD_MATCH|MAYBE|LOW_MATCH>"
            }]
        `;

        try {
            const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
            let text = response.text || '';
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            
            const batchResults = JSON.parse(text);
            results.push(...batchResults.map(r => ({ ...r, originalIndex: i + r.jobIndex })));
        } catch (error) {
            console.error('[JobFinder] AI scoring batch failed:', error.message);
            batch.forEach((_, idx) => {
                results.push({ jobIndex: idx, originalIndex: i + idx, score: 0, recommendation: 'LOW_MATCH' });
            });
        }
    }
    
    return jobs.map((job, idx) => {
        const aiRes = results.find(r => r.originalIndex === idx);
        return {
            job,
            aiScore: aiRes?.score || 0,
            summary: aiRes?.summary || '',
            matchingSkills: aiRes?.matchingSkills || [],
            missingSkills: aiRes?.missingSkills || [],
            evidence: aiRes?.evidence || [],
            concerns: aiRes?.concerns || [],
            recommendation: aiRes?.recommendation || 'MAYBE'
        };
    });
};

const calculateHybridScore = (deterministicScore, aiScore) => {
    return Math.round(deterministicScore * 0.4 + aiScore * 0.6);
};

module.exports = {
    buildCandidateProfile,
    scoreJobDeterministic,
    scoreJobsWithAI,
    calculateHybridScore
};
