const ExternalJob = require("../../models/ExternalJob");
const JobRecommendation = require("../../models/JobRecommendation");

const generateNormalizedId = (source, companySlug, externalId) => {
    return `${source}:${companySlug}:${externalId}`;
};

const deduplicateJobs = (jobs) => {
    const unique = new Map();
    for (const job of jobs) {
        const nid = job.normalizedId || generateNormalizedId(job.source, job.companySlug, job.externalId);
        job.normalizedId = nid;
        if (!unique.has(nid)) {
            unique.set(nid, job);
        }
    }
    return Array.from(unique.values());
};

const excludeAlreadySeen = async (jobs, candidateId) => {
    const recommendations = await JobRecommendation.find({ candidate: candidateId }).select('externalJob');
    const externalJobIds = recommendations.map(r => r.externalJob);
    const seenJobs = await ExternalJob.find({ _id: { $in: externalJobIds } }).select('normalizedId');
    
    const seenNormalizedIds = new Set(seenJobs.map(j => j.normalizedId));
    return jobs.filter(job => !seenNormalizedIds.has(job.normalizedId));
};

module.exports = { deduplicateJobs, generateNormalizedId, excludeAlreadySeen };
