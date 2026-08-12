const axios = require("axios");

const GREENHOUSE_COMPANIES = ['airbnb', 'cloudflare', 'figma', 'hashicorp', 'notion', 'twitch', 'discord', 'airtable', 'cockroachlabs', 'gusto', 'netlify', 'webflow', 'brex', 'ramp', 'anduril'];

const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';
const detectRemote = (job) => {
    const loc = (job.location?.name || '').toLowerCase();
    return loc.includes('remote');
};
const extractSkills = (job) => {
    // Simple mock extraction based on content
    return ''; 
};
const extractLocation = (job) => job.location?.name || '';

const fetchGreenhouseJobs = async () => {
    const results = [];
    const promises = GREENHOUSE_COMPANIES.map(async (slug) => {
        try {
            const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, { timeout: 10000 });
            const jobs = response.data.jobs || [];
            return jobs.map(job => ({
                externalId: String(job.id),
                source: 'greenhouse',
                company: response.data.name || slug,
                companySlug: slug,
                title: job.title,
                location: extractLocation(job),
                remote: detectRemote(job),
                description: stripHtml(job.content),
                requirements: '',
                skills: extractSkills(job),
                postedAt: job.updated_at,
                applicationUrl: job.absolute_url
            }));
        } catch (error) {
            console.warn(`[JobFinder] Greenhouse warning for ${slug}:`, error.message);
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

module.exports = { fetchGreenhouseJobs };
