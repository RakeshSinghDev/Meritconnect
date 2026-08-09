const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
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

        interviewDate: {
            type: Date,
            required: true,
        },

        duration: {
            type: Number,
            default: 60,
        },

        mode: {
            type: String,
            enum: [
                "Online",
                "Offline",
            ],
            required: true,
        },

        meetingLink: {
            type: String,
        },

        venue: {
            type: String,
        },

        notes: {
            type: String,
        },

        status: {
            type: String,
            enum: [
                "Scheduled",
                "Completed",
                "Cancelled",
            ],
            default: "Scheduled",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Interview",
    interviewSchema
);