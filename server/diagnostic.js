const mongoose = require('mongoose');
require('dotenv').config();

const { fetchAllATS } = require('./src/services/jobFinder/ats');
const { applyAllFilters } = require('./src/services/jobFinder/filter.service');
const JobSearchPreference = require('./src/models/JobSearchPreference');
const User = require('./src/models/User');

const runDiagnostics = async () => {
    try {
        console.log('[Diagnostic] Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Diagnostic] Connected successfully.');

        const candidateId = '6a60660c5263010533cf59d9';
        const user = await User.findById(candidateId);
        if (!user) {
            console.error('[Diagnostic] Candidate user not found in database.');
            process.exit(1);
        }
        console.log(`[Diagnostic] Loaded Candidate: ${user.name} (${user.email})`);

        let preferences = await JobSearchPreference.findOne({ candidate: candidateId });
        if (!preferences) {
            console.warn('[Diagnostic] Preferences not found. Using defaults.');
            preferences = {
                candidate: candidateId,
                targetTitles: ['software engineer'],
                locations: ['Remote'],
                allowRemote: true,
                employmentTypes: [],
                experienceMin: 0,
                experienceMax: 5,
                excludedTitles: [],
                enabled: true
            };
        }
        console.log('[Diagnostic] Stored Preferences:', JSON.stringify(preferences, null, 2));

        console.log('[Diagnostic] Fetching jobs from ATS (Greenhouse, Lever, Ashby)...');
        const { jobs, errors } = await fetchAllATS();
        console.log(`[Diagnostic] Total jobs fetched: ${jobs.length}`);
        if (errors.length > 0) {
            console.warn(`[Diagnostic] ATS errors occurred:`, errors);
        }

        // Run the sequential filters manually to count precisely
        const filterService = require('./src/services/jobFinder/filter.service');
        
        let currentJobs = jobs;
        const fetchedCount = currentJobs.length;

        // Title filter
        const afterTitle = filterService.filterByTitles(currentJobs, preferences.targetTitles);
        const titleRejected = currentJobs.length - afterTitle.length;
        currentJobs = afterTitle;

        // Excluded title filter
        const afterExcluded = filterService.filterByExcludedTitles(currentJobs, preferences.excludedTitles);
        const excludedRejected = currentJobs.length - afterExcluded.length;
        currentJobs = afterExcluded;

        // Location filter
        const afterLocation = filterService.filterByLocation(currentJobs, preferences.locations, preferences.allowRemote);
        const locationRejected = currentJobs.length - afterLocation.length;
        currentJobs = afterLocation;

        // Experience filter
        const afterExperience = filterService.filterByExperience(currentJobs, preferences.experienceMin, preferences.experienceMax);
        const experienceRejected = currentJobs.length - afterExperience.length;
        currentJobs = afterExperience;

        // Employment type filter
        const afterEmployment = filterService.filterByEmploymentType(currentJobs, preferences.employmentTypes);
        const employmentRejected = currentJobs.length - afterEmployment.length;
        currentJobs = afterEmployment;

        // Freshness filter
        const afterFreshness = filterService.filterByFreshness(currentJobs, 30);
        const freshnessRejected = currentJobs.length - afterFreshness.length;
        currentJobs = afterFreshness;

        console.log('\n=== DIAGNOSTICS REPORT ===');
        const report = {
            fetched: fetchedCount,
            titlePassed: afterTitle.length,
            excludedTitlePassed: afterExcluded.length,
            locationPassed: afterLocation.length,
            experiencePassed: afterExperience.length,
            employmentTypePassed: afterEmployment.length,
            freshnessPassed: afterFreshness.length,
            finalFiltered: currentJobs.length
        };
        console.log(JSON.stringify(report, null, 2));

        console.log('\n=== REJECTION BREAKDOWN (SEQUENTIAL) ===');
        console.log(`Title filter rejected: ${titleRejected}`);
        console.log(`Excluded titles filter rejected: ${excludedRejected}`);
        console.log(`Location filter rejected: ${locationRejected}`);
        console.log(`Experience filter rejected: ${experienceRejected}`);
        console.log(`Employment type filter rejected: ${employmentRejected}`);
        console.log(`Freshness filter rejected: ${freshnessRejected}`);

        // Sample some titles that were passed or rejected
        if (afterTitle.length > 0) {
            console.log('\n=== SAMPLE PASSED TITLES (Top 5) ===');
            afterTitle.slice(0, 5).forEach(j => console.log(`- [${j.source}] ${j.company}: ${j.title} (${j.location})`));
        }

        const rejectedTitles = jobs.filter(j => !afterTitle.includes(j));
        if (rejectedTitles.length > 0) {
            console.log('\n=== SAMPLE REJECTED TITLES (Top 5) ===');
            rejectedTitles.slice(0, 5).forEach(j => console.log(`- [${j.source}] ${j.company}: ${j.title} (${j.location})`));
        }

        await mongoose.disconnect();
        console.log('[Diagnostic] Disconnected.');
    } catch (err) {
        console.error('[Diagnostic] Error running diagnostics:', err);
    }
};

runDiagnostics();
