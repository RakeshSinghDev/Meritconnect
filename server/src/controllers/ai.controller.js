const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const { analyzeResume } = require("../services/ai.service");

// Models
const Application = require("../models/Application");

// ===============================
// Test AI
// ===============================

exports.testAI = asyncHandler(async (req, res) => {

    const resume = `
MERN Stack Developer

Skills:
Node.js
Express.js
MongoDB
React
JWT
REST API

Projects:
Job Portal
E-Commerce Website
`;

    const job = `
Looking for Backend Developer.

Skills required:

Node.js
Express
MongoDB
Docker
Redis
AWS
`;

    const result = await analyzeResume(resume, job);

    res.json(
        new ApiResponse(
            200,
            "AI Working",
            result
        )
    );

});

// ===============================
// Resume Analysis
// ===============================

exports.resumeAnalysis = asyncHandler(async (req, res) => {

    const { applicationId } = req.body;

    if (!applicationId) {

        return res.status(400).json(
            new ApiResponse(
                400,
                "Application ID is required"
            )
        );

    }

    const application = await Application
        .findById(applicationId)
        .populate("job");

    if (!application) {

        return res.status(404).json(
            new ApiResponse(
                404,
                "Application not found"
            )
        );

    }

    if (!application.resumeText) {

        return res.status(400).json(
            new ApiResponse(
                400,
                "Resume text not found"
            )
        );

    }

    const aiResult = await analyzeResume(
        application.resumeText,
        application.job.description
    );
    console.log("Gemini Response:");
    console.dir(aiResult, { depth: null });

    const response = {

        overallScore: aiResult.atsScore,

        atsScore: aiResult.atsScore,

        recommendation:
            aiResult.atsScore >= 85
                ? "Strong Hire"
                : aiResult.atsScore >= 70
                    ? "Hire"
                    : aiResult.atsScore >= 55
                        ? "Consider"
                        : "Reject",

        summary: aiResult.summary,

        strengths: aiResult.strengths,

        matchedSkills: aiResult.matchingSkills,

        missingSkills: aiResult.missingSkills,

        experience: {
            candidate: application.candidateExperience || "Not Available",
            required: application.job.experience,
        },

        education: "Bachelor's Degree",

        projectsScore: 4.5,

    };

    application.aiAnalysis = aiResult;

    application.aiAnalysis.analyzedAt = new Date();

    await application.save();

    res.json(
        new ApiResponse(
            200,
            "Resume analyzed successfully",
            response
        )
    );

});