const {
    filterByTitles,
    filterByExcludedTitles,
    filterByLocation,
    filterByExperience,
    filterByEmploymentType,
    filterByFreshness,
    applyAllFilters
} = require("../../services/jobFinder/filter.service");

describe("Job Finder Filter Service", () => {
    const sampleJobs = [
        {
            title: "Backend Engineer",
            location: "Bangalore, India",
            remote: true,
            description: "2 years experience required. Node.js backend development.",
            employmentType: "Full-Time",
            postedAt: new Date()
        },
        {
            title: "Senior Staff Architect",
            location: "San Francisco, CA",
            remote: false,
            description: "10+ years experience leading backend infrastructure.",
            employmentType: "Full-Time",
            postedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days old
        },
        {
            title: "Frontend Developer",
            location: "Remote",
            remote: true,
            description: "React expert needed.",
            employmentType: "Contract",
            postedAt: new Date()
        }
    ];

    test("filterByTitles matches included target titles", () => {
        const result = filterByTitles(sampleJobs, ["backend"]);
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Backend Engineer");
    });

    test("filterByExcludedTitles excludes senior/staff roles", () => {
        const result = filterByExcludedTitles(sampleJobs, ["staff", "architect"]);
        expect(result.length).toBe(2);
        expect(result.find(j => j.title.includes("Architect"))).toBeUndefined();
    });

    test("filterByLocation handles remote and location matching", () => {
        const result = filterByLocation(sampleJobs, ["Bangalore"], true);
        // Both Backend (Bangalore + Remote) and Frontend (Remote) should match when allowRemote is true
        expect(result.length).toBe(2);
    });

    test("filterByFreshness filters out old jobs", () => {
        const result = filterByFreshness(sampleJobs, 30);
        expect(result.length).toBe(2);
    });

    test("applyAllFilters orchestrates filtering correctly", () => {
        const prefs = {
            targetTitles: ["backend", "frontend"],
            excludedTitles: ["staff"],
            locations: ["Bangalore"],
            allowRemote: true,
            employmentTypes: ["Full-Time", "Contract"],
            experienceMin: 0,
            experienceMax: 5
        };

        const filtered = applyAllFilters(sampleJobs, prefs);
        expect(filtered.length).toBe(2);
    });
});
