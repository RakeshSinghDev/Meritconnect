const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
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

        coverLetter: {
            type: String,
            default: "",
            trim: true,
        },

        resume: {
            url: {
                type: String,
                default: "",
            },

            publicId: {
                type: String,
                default: "",
            },

            fileName: {
                type: String,
                default: "",
            },
        },
        resumeText: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "Applied",
                "Reviewed",
                "Shortlisted",
                "Interview",
                "Rejected",
                "Hired",
            ],
            default: "Applied",
        },

        aiAnalysis: {
            atsScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },

            summary: {
                type: String,
                default: "",
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

            strengths: [
                {
                    type: String,
                    trim: true,
                },
            ],

            suggestions: [
                {
                    type: String,
                    trim: true,
                },
            ],

            analyzedAt: {
                type: Date,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications for the same job
applicationSchema.index(
    {
        candidate: 1,
        job: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Application", applicationSchema);