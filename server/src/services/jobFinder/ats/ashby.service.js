const axios = require("axios");

const ASHBY_COMPANIES = ['linear', 'ramp', 'notion', 'causal', 'stytch'];
const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';
const detectRemote = (job) => {
    const loc = (job.location || '').toLowerCase();
    return loc.includes('remote');
};

const fetchAshbyJobs = async () => {
    const results = [];
    const promises = ASHBY_COMPANIES.map(async (company) => {
        try {
            const response = await axios.post(`https://api.ashbyhq.com/posting-api/job-board/${company}`, {}, { timeout: 10000 });
            const jobs = response.data.jobs || [];
            return jobs.map(job => ({
                externalId: String(job.id),
                source: 'ashby',
                company: company,
                companySlug: company,
                title: job.title,
                location: job.location || '',
                remote: detectRemote(job),
                description: stripHtml(job.descriptionHtml),
                requirements: '',
                skills: '',
                postedAt: job.publishedAt ? new Date(job.publishedAt) : new Date(),
                applicationUrl: job.jobUrl
            }));
        } catch (error) {
            console.warn(`[JobFinder] Ashby warning for ${company}:`, error.message);
            return [];
        }
    });

    const settled = await Promise.allSettled(promises);
    for (const res of settled) {
        if (res.status === 'fulfilled') {
            results.push(...res.value);
        }
    }
    return results;
};

module.exports = { fetchAshbyJobs };
