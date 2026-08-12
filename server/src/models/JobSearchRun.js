const mongoose = require("mongoose");

const jobSearchRunSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["RUNNING", "COMPLETED", "PARTIAL", "FAILED"],
            default: "RUNNING",
        },

        scanned: {
            type: Number,
            default: 0,
        },

        filtered: {
            type: Number,
            default: 0,
        },

        newJobs: {
            type: Number,
            default: 0,
        },

        matched: {
            type: Number,
            default: 0,
        },

        recommended: {
            type: Number,
            default: 0,
        },

        errors: [
            {
                source: { type: String, default: "" },
                message: { type: String, default: "" },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

jobSearchRunSchema.index({ candidate: 1, startedAt: -1 });

module.exports = mongoose.model("JobSearchRun", jobSearchRunSchema);
