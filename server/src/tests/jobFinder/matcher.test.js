const {
    scoreJobDeterministic,
    calculateHybridScore
} = require("../../services/jobFinder/matcher.service");

describe("Job Finder Matcher Service", () => {
    const candidateProfile = {
        name: "Test Candidate",
        skills: ["Node.js", "React", "MongoDB"],
        currentPosition: "Backend Developer",
        location: "Bangalore"
    };

    test("scoreJobDeterministic calculates correct score based on criteria", () => {
        const job = {
            title: "Senior Backend Developer",
            skills: "Node.js, Express, MongoDB, AWS",
            location: "Bangalore, India",
            remote: true,
            postedAt: new Date()
        };

        const score = scoreJobDeterministic(job, candidateProfile);
        expect(score).toBeGreaterThan(50);
        expect(score).toBeLessThanOrEqual(100);
    });

    test("calculateHybridScore computes weighted average", () => {
        // 40% deterministic + 60% AI
        const hybrid = calculateHybridScore(80, 90);
        expect(hybrid).toBe(86); // Math.round(80 * 0.4 + 90 * 0.6) = 32 + 54 = 86
    });
});
