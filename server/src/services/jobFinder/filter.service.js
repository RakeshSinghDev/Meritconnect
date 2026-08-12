const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Title filter: checks if the job title contains ANY of the target keywords.
 * Uses case-insensitive substring matching (not word-boundary) so that
 * "Software Engineer", "Software Development Engineer", "Sr. Software Engineer",
 * "Associate Software Engineer" etc. all match when "software engineer" is a target.
 * 
 * Individual target words are also matched independently so "software engineer"
 * matches titles containing "software" OR "engineer" as whole words, plus the
 * full phrase as a substring.
 */
const filterByTitles = (jobs, titles) => {
    if (!titles || titles.length === 0) return jobs;

    // Pre-compute matching patterns for each target title
    const matchers = titles.map(title => {
        const lower = title.toLowerCase().trim();
        // Split multi-word titles into individual keywords for flexible matching
        const words = lower.split(/\s+/).filter(w => w.length >= 3); // ignore tiny words
        return { phrase: lower, words };
    });

    return jobs.filter(job => {
        const jobTitle = (job.title || '').toLowerCase();
        return matchers.some(({ phrase, words }) => {
            // Match if the full phrase appears as a substring
            if (jobTitle.includes(phrase)) return true;
            // Match if ALL significant words from the target appear in the title
            // e.g. "software engineer" matches "Senior Software Engineer" and
            // "Software Development Engineer" 
            if (words.length > 1 && words.every(w => jobTitle.includes(w))) return true;
            // Match if any single keyword matches as a whole word
            // e.g. "engineer" matches "Backend Engineer"
            return words.some(w => {
                const regex = new RegExp('\\b' + escapeRegex(w) + '\\b', 'i');
                return regex.test(jobTitle);
            });
        });
    });
};

const filterByExcludedTitles = (jobs, excluded) => {
    if (!excluded || excluded.length === 0) return jobs;
    return jobs.filter(job => {
        const jobTitle = (job.title || '').toLowerCase();
        return !excluded.some(title => {
            const regex = new RegExp('\\b' + escapeRegex(title) + '\\b', 'i');
            return regex.test(jobTitle);
        });
    });
};

/**
 * Location filter:
 * - If allowRemote is true, always keep remote jobs
 * - If no locations specified and allowRemote is true, keep ALL jobs
 *   (the AI scorer will rank location-matched jobs higher)
 * - If locations are specified, keep jobs whose location matches any target
 * - If a job has no location data, keep it (let the AI scorer decide)
 */
const filterByLocation = (jobs, locations, allowRemote) => {
    // If allowRemote and no specific locations, keep everything
    if (allowRemote && (!locations || locations.length === 0)) return jobs;
    // If allowRemote and the only location is "Remote", keep everything
    // (remote jobs pass via remote flag, others pass to let AI decide)
    const nonRemoteLocations = (locations || []).filter(
        loc => loc.toLowerCase() !== 'remote'
    );
    if (allowRemote && nonRemoteLocations.length === 0) return jobs;

    return jobs.filter(job => {
        // Always keep remote-tagged jobs if candidate allows remote
        if (allowRemote && job.remote) return true;
        // Keep if job location matches any target location
        if (job.location && nonRemoteLocations.length > 0) {
            const jobLoc = job.location.toLowerCase();
            if (nonRemoteLocations.some(loc => jobLoc.includes(loc.toLowerCase()))) return true;
        }
        // If no location data on the job, keep it (let AI decide)
        if (!job.location) return true;
        // If allowRemote, also check location string for "remote" keyword
        if (allowRemote) {
            const jobLoc = job.location.toLowerCase();
            if (jobLoc.includes('remote')) return true;
        }
        return false;
    });
};

/**
 * Experience filter: only rejects jobs that EXPLICITLY require MORE than
 * the candidate's max experience. Jobs without parseable experience requirements
 * are kept (let the AI scorer decide).
 * 
 * Uses the MINIMUM years found in the description (e.g. "3-5 years" → 3)
 * so we don't reject jobs asking for "0-5 years" when max is 2.
 */
const filterByExperience = (jobs, min, max) => {
    if (min == null && max == null) return jobs;
    return jobs.filter(job => {
        const desc = (job.description || '').toLowerCase();
        // Match patterns like "3+ years", "3-5 years", "3 years of experience"
        const expMatches = desc.matchAll(/(\d+)\+?\s*(?:[-–to]+\s*\d+\s*)?years?\s*(?:of\s*)?(?:experience|exp)?/gi);
        const years = [];
        for (const m of expMatches) {
            years.push(parseInt(m[1], 10));
        }
        if (years.length === 0) return true; // No parseable experience → keep
        const minRequired = Math.min(...years);
        // Only reject if the minimum required experience exceeds candidate's max
        if (max != null && minRequired > max + 2) return false;
        return true;
    });
};

const filterByEmploymentType = (jobs, types) => {
    if (!types || types.length === 0) return jobs;
    return jobs.filter(job => {
        if (!job.employmentType) return true; // Keep if no type specified
        return types.some(t => t.toLowerCase() === job.employmentType.toLowerCase());
    });
};

const filterByFreshness = (jobs, maxAgeDays = 30) => {
    if (!maxAgeDays) return jobs;
    const now = new Date();
    return jobs.filter(job => {
        if (!job.postedAt) return true; // Keep if no date
        const posted = new Date(job.postedAt);
        const diffDays = (now - posted) / (1000 * 60 * 60 * 24);
        return diffDays <= maxAgeDays;
    });
};

/**
 * Apply all deterministic filters in sequence, logging counts after each step.
 * Returns the filtered jobs array.
 */
const applyAllFilters = (jobs, preferences) => {
    const log = (stage, arr) => console.log(`[JobFinder]   ${stage}: ${arr.length} jobs`);
    let filtered = jobs;
    log('input', filtered);

    filtered = filterByTitles(filtered, preferences.targetTitles);
    log('after title filter', filtered);

    filtered = filterByExcludedTitles(filtered, preferences.excludedTitles);
    log('after excluded-title filter', filtered);

    filtered = filterByLocation(filtered, preferences.locations, preferences.allowRemote);
    log('after location filter', filtered);

    filtered = filterByExperience(filtered, preferences.experienceMin, preferences.experienceMax);
    log('after experience filter', filtered);

    filtered = filterByEmploymentType(filtered, preferences.employmentTypes);
    log('after employment-type filter', filtered);

    filtered = filterByFreshness(filtered, 30);
    log('after freshness filter', filtered);

    return filtered;
};

module.exports = {
    escapeRegex,
    filterByTitles,
    filterByExcludedTitles,
    filterByLocation,
    filterByExperience,
    filterByEmploymentType,
    filterByFreshness,
    applyAllFilters
};
