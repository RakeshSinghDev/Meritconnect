const { fetchGreenhouseJobs } = require("./greenhouse.service");
const { fetchLeverJobs } = require("./lever.service");
const { fetchAshbyJobs } = require("./ashby.service");

const fetchAllATS = async () => {
    const jobs = [];
    const errors = [];

    console.log('[JobFinder] Starting ATS fetch...');

    const results = await Promise.allSettled([
        fetchGreenhouseJobs(),
        fetchLeverJobs(),
        fetchAshbyJobs()
    ]);

    const [greenhouseRes, leverRes, ashbyRes] = results;

    if (greenhouseRes.status === 'fulfilled') {
        jobs.push(...greenhouseRes.value);
        console.log(`[JobFinder] Fetched ${greenhouseRes.value.length} Greenhouse jobs`);
    } else {
        errors.push({ source: 'greenhouse', message: greenhouseRes.reason.message, timestamp: new Date() });
    }

    if (leverRes.status === 'fulfilled') {
        jobs.push(...leverRes.value);
        console.log(`[JobFinder] Fetched ${leverRes.value.length} Lever jobs`);
    } else {
        errors.push({ source: 'lever', message: leverRes.reason.message, timestamp: new Date() });
    }

    if (ashbyRes.status === 'fulfilled') {
        jobs.push(...ashbyRes.value);
        console.log(`[JobFinder] Fetched ${ashbyRes.value.length} Ashby jobs`);
    } else {
        errors.push({ source: 'ashby', message: ashbyRes.reason.message, timestamp: new Date() });
    }

    console.log(`[JobFinder] Total jobs fetched: ${jobs.length}`);

    return { jobs, errors };
};

module.exports = { fetchAllATS };
