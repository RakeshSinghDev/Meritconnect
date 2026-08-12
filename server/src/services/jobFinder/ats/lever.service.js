const axios = require("axios");

const LEVER_COMPANIES = ['netflix', 'spotify', 'grab', 'pagerduty', 'samsara', 'onefinance', 'talkdesk', 'relativity', 'verkada', 'benchling'];

const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';
const detectRemote = (posting) => {
    const loc = (posting.categories?.location || '').toLowerCase();
    const wp = (posting.workplaceType || '').toLowerCase();
    return loc.includes('remote') || wp.includes('remote');
};

const fetchLeverJobs = async () => {
    const results = [];
    const promises = LEVER_COMPANIES.map(async (company) => {
        try {
            const response = await axios.get(`https://api.lever.co/v0/postings/${company}`, { timeout: 10000 });
            const jobs = response.data || [];
            return jobs.map(posting => ({
                externalId: String(posting.id),
                source: 'lever',
                company: company,
                companySlug: company,
                title: posting.text,
                location: posting.categories?.location || '',
                remote: detectRemote(posting),
                description: stripHtml(posting.descriptionPlain || posting.description),
                requirements: '',
                skills: '',
                postedAt: posting.createdAt ? new Date(posting.createdAt) : new Date(),
                applicationUrl: posting.hostedUrl
            }));
        } catch (error) {
            console.warn(`[JobFinder] Lever warning for ${company}:`, error.message);
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

module.exports = { fetchLeverJobs };
