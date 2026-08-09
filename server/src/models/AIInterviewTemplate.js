const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["assistant", "candidate"],
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },

        evaluation: {
            technical: {
                type: Number,
                default: 0,
            },

            communication: {
                type: Number,
                default: 0,
            },

            confidence: {
                type: Number,
                default: 0,
            },

            overall: {
                type: Number,
                default: 0,
            },

            feedback: {
                type: String,
                default: "",
            },
        },
    },
    {
        _id: false,
    }
);

const aiInterviewSessionSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

        settings: {
            difficulty: {
                type: String,
                enum: ["Easy", "Medium", "Hard"],
                default: "Medium",
            },

            interviewDuration: {
                type: Number,
                default: 60,
            },

            codingRound: {
                type: Boolean,
                default: true,
            },

            behavioralRound: {
                type: Boolean,
                default: true,
            },

            focusAreas: [
                {
                    type: String,
                },
            ],
        },

        currentStage: {
            type: String,
            enum: [
                "INTRODUCTION",
                "RESUME",
                "PROJECT",
                "TECHNICAL",
                "BEHAVIORAL",
                "CODING",
                "HR",
                "COMPLETED",
            ],
            default: "INTRODUCTION",
        },

        currentQuestion: {
            type: String,
            default: "",
        },

        transcript: [transcriptSchema],

        score: {
            technical: {
                type: Number,
                default: 0,
            },

            communication: {
                type: Number,
                default: 0,
            },

            confidence: {
                type: Number,
                default: 0,
            },

            coding: {
                type: Number,
                default: 0,
            },

            leadership: {
                type: Number,
                default: 0,
            },

            overall: {
                type: Number,
                default: 0,
            },
        },

        report: {
            recommendation: {
                type: String,
                default: "",
            },

            summary: {
                type: String,
                default: "",
            },

            strengths: [
                {
                    type: String,
                },
            ],

            weaknesses: [
                {
                    type: String,
                },
            ],
        },

        status: {
            type: String,
            enum: [
                "Scheduled",
                "In Progress",
                "Completed",
                "Cancelled",
            ],
            default: "Scheduled",
        },

        startedAt: Date,

        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "AIInterviewSession",
    aiInterviewSessionSchema
);
module.exports = {

    generateInterviewQuestions,

    createInterviewSession,

};