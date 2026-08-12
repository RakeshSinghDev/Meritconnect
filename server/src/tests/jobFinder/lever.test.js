const axios = require("axios");
const { fetchLeverJobs } = require("../../services/jobFinder/ats/lever.service");

jest.mock("axios");

describe("Lever ATS Adapter", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("fetches and normalizes Lever jobs", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("spotify")) {
                return Promise.resolve({
                    data: [
                        {
                            id: "lev-101",
                            text: "Backend Engineer",
                            categories: { location: "San Francisco, CA" },
                            descriptionPlain: "Node.js & Go developer position.",
                            hostedUrl: "https://jobs.lever.co/spotify/lev-101",
                            createdAt: Date.now()
                        }
                    ]
                });
            }
            return Promise.reject(new Error("Network error"));
        });

        const jobs = await fetchLeverJobs();
        expect(Array.isArray(jobs)).toBe(true);
        if (jobs.length > 0) {
            const sample = jobs.find(j => j.externalId === "lev-101");
            if (sample) {
                expect(sample.source).toBe("lever");
                expect(sample.companySlug).toBe("spotify");
                expect(sample.title).toBe("Backend Engineer");
            }
        }
    });
});
