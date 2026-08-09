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

        stage: {
            type: String,
            enum: [
                "INTRODUCTION",
                "RESUME",
                "PROJECT",
                "TECHNICAL",
                "BEHAVIORAL",
                "CODING",
                "HR",
            ],
            default: "INTRODUCTION",
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

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const interviewSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            unique: true,
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

            duration: {
                type: Number,
                default: 45,
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
        currentQuestionIndex: {

            type: Number,

            default: 0,

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

        recommendation: {
            type: String,
            default: "",
        },

        summary: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "scheduled",
                "running",
                "completed",
                "cancelled"
            ],
            default: "scheduled",
        },
        report: {

            strengths: [String],

            weaknesses: [String],

            recommendation: {

                type: String,

                default: ""

            },

            summary: {

                type: String,

                default: ""

            }

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
    interviewSchema
);