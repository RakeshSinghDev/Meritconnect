const { generateApplicationKit } = require("../../services/jobFinder/applicationKit.service");

// Mock Gemini AI
jest.mock("../../config/gemini", () => ({
    ai: {
        models: {
            generateContent: jest.fn().mockResolvedValue({
                text: JSON.stringify({
                    whyFits: "Great match for backend experience.",
                    resumeEmphasis: ["Highlight Node.js expertise"],
                    potentialGaps: ["No direct Go experience"],
                    coverNote: "Dear Hiring Team, I am excited to apply...",
                    applicationAnswers: [
                        { question: "Years of experience?", answer: "2+ years building APIs." }
                    ]
                })
            })
        }
    },
    GEMINI_MODEL: "gemini-1.5-flash"
}));

describe("Application Kit Service", () => {
    test("generateApplicationKit returns formatted kit object", async () => {
        const job = { title: "Backend Engineer", company: "Figma", description: "Node.js role" };
        const profile = { name: "John", skills: ["Node.js"] };
        const matchResult = { score: 85, matchingSkills: ["Node.js"] };

        const kit = await generateApplicationKit(job, profile, matchResult);
        expect(kit.whyFits).toContain("backend");
        expect(kit.coverNote).toContain("Dear Hiring Team");
        expect(Array.isArray(kit.applicationAnswers)).toBe(true);
    });
});
