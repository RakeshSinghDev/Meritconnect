const mongoose = require("mongoose");

const jobRecommendationSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        externalJob: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExternalJob",
            required: true,
        },

        searchRun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobSearchRun",
            default: null,
        },

        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        deterministicScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        aiScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        matchingSkills: [
            {
                type: String,
                trim: true,
            },
        ],

        missingSkills: [
            {
                type: String,
                trim: true,
            },
        ],

        reasons: [
            {
                type: String,
                trim: true,
            },
        ],

        aiSummary: {
            type: String,
            default: "",
        },

        recommendation: {
            type: String,
            enum: ["HIGH_PRIORITY", "GOOD_MATCH", "MAYBE", "LOW_MATCH"],
            default: "MAYBE",
        },

        evidence: [
            {
                type: String,
                trim: true,
            },
        ],

        concerns: [
            {
                type: String,
                trim: true,
            },
        ],

        coverLetter: {
            type: String,
            default: "",
        },

        applicationAnswers: [
            {
                question: { type: String, default: "" },
                answer: { type: String, default: "" },
            },
        ],

        kitGeneratedAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["NEW", "VIEWED", "SAVED", "APPLYING", "APPLIED", "DISMISSED"],
            default: "NEW",
        },
    },
    {
        timestamps: true,
    }
);

// A candidate should only have one recommendation per external job
jobRecommendationSchema.index({ candidate: 1, externalJob: 1 }, { unique: true });
jobRecommendationSchema.index({ candidate: 1, status: 1 });
jobRecommendationSchema.index({ candidate: 1, matchScore: -1 });

module.exports = mongoose.model("JobRecommendation", jobRecommendationSchema);
