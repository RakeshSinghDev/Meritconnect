const mongoose = require("mongoose");

const aiInterviewSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "Technical",
                "Behavioral",
                "Coding",
                "SystemDesign",
                "ResumeDeepDive",
                "ProjectDeepDive",
                "Communication",
                "ProblemSolving",
                "Leadership",
                "HR",
                "Mixed",
            ],
            default: "Mixed",
        },

        status: {
            type: String,
            enum: ["Waiting", "InProgress", "Completed", "Abandoned", "Expired"],
            default: "Waiting",
        },

        config: {
            duration: { type: Number, default: 45 },
            difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Adaptive"], default: "Adaptive" },
            focusAreas: [{ type: String }],
            questionCount: { type: Number, default: 6 },
            codingEnabled: { type: Boolean, default: true },
            systemDesignEnabled: { type: Boolean, default: false },
        },

        context: {
            resumeText: { type: String, default: "" },
            atsScore: { type: Number, default: 0 },
            matchingSkills: [{ type: String }],
            missingSkills: [{ type: String }],
            strengths: [{ type: String }],
            candidateProfile: { type: Object, default: {} },
            jobDescription: { type: String, default: "" },
            jobSkills: [{ type: String }],
        },

        questions: [
            {
                index: { type: Number },
                type: { type: String },
                question: { type: String },
                expectedAnswer: { type: String, default: "" },
                candidateAnswer: { type: String, default: "" },
                aiEvaluation: {
                    score: { type: Number, default: 0 },
                    feedback: { type: String, default: "" },
                    strengths: [{ type: String }],
                    weaknesses: [{ type: String }],
                },
                timeSpent: { type: Number, default: 0 },
                difficulty: { type: String, default: "Medium" },
                status: { type: String, enum: ["Pending", "Answered", "Skipped"], default: "Pending" },
                followUpOf: { type: Number, default: null },
            },
        ],

        codingChallenges: [
            {
                title: { type: String },
                description: { type: String },
                boilerplate: { type: String },
                language: { type: String, default: "javascript" },
                candidateCode: { type: String, default: "" },
                testCases: [
                    {
                        input: { type: String },
                        expectedOutput: { type: String },
                        passed: { type: Boolean, default: false },
                    },
                ],
                aiEvaluation: {
                    correctness: { type: Number, default: 0 },
                    efficiency: { type: Number, default: 0 },
                    codeQuality: { type: Number, default: 0 },
                    timeComplexity: { type: String, default: "" },
                    spaceComplexity: { type: String, default: "" },
                    feedback: { type: String, default: "" },
                },
                timeSpent: { type: Number, default: 0 },
            },
        ],

        metrics: {
            confidenceScores: [
                {
                    timestamp: { type: Date, default: Date.now },
                    score: { type: Number, default: 0 },
                },
            ],
            speakingSpeed: [
                {
                    timestamp: { type: Date, default: Date.now },
                    wpm: { type: Number, default: 0 },
                },
            ],
            fillerWords: {
                count: { type: Number, default: 0 },
                words: [{ type: String }],
            },
            eyeContactScore: { type: Number, default: 100 },
            overallEngagement: { type: Number, default: 100 },
        },

        report: {
            overallScore: { type: Number, default: 0 },
            technicalScore: { type: Number, default: 0 },
            communicationScore: { type: Number, default: 0 },
            confidenceScore: { type: Number, default: 0 },
            behaviorScore: { type: Number, default: 0 },
            problemSolvingScore: { type: Number, default: 0 },
            projectsScore: { type: Number, default: 0 },
            resumeAuthenticityScore: { type: Number, default: 0 },
            codingScore: { type: Number, default: 0 },
            grammarScore: { type: Number, default: 0 },
            vocabularyScore: { type: Number, default: 0 },
            leadershipScore: { type: Number, default: 0 },
            systemDesignScore: { type: Number, default: 0 },
            hiringRecommendation: {
                type: String,
                enum: ["Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire", "Pending"],
                default: "Pending",
            },
            strengths: [{ type: String }],
            weaknesses: [{ type: String }],
            improvementPlan: [{ type: String }],
            scoreExplanations: { type: Object, default: {} },
            detailedAnalysis: { type: String, default: "" },
            pdfUrl: { type: String, default: "" },
            generatedAt: { type: Date },
        },

        transcript: [
            {
                role: { type: String, enum: ["interviewer", "candidate"] },
                content: { type: String },
                timestamp: { type: Date, default: Date.now },
            },
        ],

        recording: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
            duration: { type: Number, default: 0 },
        },

        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

aiInterviewSchema.index({ candidate: 1, status: 1 });
aiInterviewSchema.index({ recruiter: 1, status: 1 });
aiInterviewSchema.index({ job: 1, status: 1 });
aiInterviewSchema.index({ application: 1 });

module.exports = mongoose.model("AIInterview", aiInterviewSchema);
