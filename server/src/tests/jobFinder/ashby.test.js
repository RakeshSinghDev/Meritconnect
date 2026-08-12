const axios = require("axios");
const { fetchAshbyJobs } = require("../../services/jobFinder/ats/ashby.service");

jest.mock("axios");

describe("Ashby ATS Adapter", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("fetches and normalizes Ashby jobs", async () => {
        axios.post.mockImplementation((url) => {
            if (url.includes("linear")) {
                return Promise.resolve({
                    data: {
                        jobs: [
                            {
                                id: "ash-301",
                                title: "Full Stack Engineer",
                                locationName: "Remote",
                                isRemote: true,
                                descriptionHtml: "<p>Build delightful features.</p>",
                                jobUrl: "https://jobs.ashbyhq.com/linear/ash-301",
                                publishedAt: "2026-08-05T00:00:00Z"
                            }
                        ]
                    }
                });
            }
            return Promise.reject(new Error("Network error"));
        });

        const jobs = await fetchAshbyJobs();
        expect(Array.isArray(jobs)).toBe(true);
        if (jobs.length > 0) {
            const sample = jobs.find(j => j.externalId === "ash-301");
            if (sample) {
                expect(sample.source).toBe("ashby");
                expect(sample.companySlug).toBe("linear");
                expect(sample.title).toBe("Full Stack Engineer");
            }
        }
    });
});
