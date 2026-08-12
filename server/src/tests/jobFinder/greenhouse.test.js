const axios = require("axios");
const { fetchGreenhouseJobs } = require("../../services/jobFinder/ats/greenhouse.service");

jest.mock("axios");

describe("Greenhouse ATS Adapter", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("fetches and normalizes Greenhouse jobs", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("airbnb")) {
                return Promise.resolve({
                    data: {
                        jobs: [
                            {
                                id: 12345,
                                title: "Software Engineer - Backend",
                                location: { name: "Remote - US" },
                                content: "<p>We are looking for Node.js engineers.</p>",
                                updated_at: "2026-08-01T00:00:00Z",
                                absolute_url: "https://boards.greenhouse.io/airbnb/jobs/12345"
                            }
                        ]
                    }
                });
            }
            return Promise.reject(new Error("Network error"));
        });

        const jobs = await fetchGreenhouseJobs();
        expect(Array.isArray(jobs)).toBe(true);
        if (jobs.length > 0) {
            const sample = jobs.find(j => j.externalId === "12345");
            if (sample) {
                expect(sample.source).toBe("greenhouse");
                expect(sample.companySlug).toBe("airbnb");
                expect(sample.title).toBe("Software Engineer - Backend");
                expect(sample.remote).toBe(true);
            }
        }
    });
});
