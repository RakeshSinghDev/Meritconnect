const { deduplicateJobs, generateNormalizedId } = require("../../services/jobFinder/dedup.service");

describe("Job Finder Deduplication Service", () => {
    test("generateNormalizedId creates consistent formatted string", () => {
        const id = generateNormalizedId("greenhouse", "airbnb", "12345");
        expect(id).toBe("greenhouse:airbnb:12345");
    });

    test("deduplicateJobs removes duplicate jobs by normalizedId", () => {
        const jobs = [
            { normalizedId: "greenhouse:airbnb:101", title: "Job 1" },
            { normalizedId: "greenhouse:airbnb:101", title: "Job 1 Duplicate" },
            { normalizedId: "lever:spotify:202", title: "Job 2" }
        ];

        const result = deduplicateJobs(jobs);
        expect(result.length).toBe(2);
        expect(result[0].title).toBe("Job 1");
        expect(result[1].title).toBe("Job 2");
    });
});
