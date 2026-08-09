const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },

        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Job description is required"],
        },

        skills: {
            type: [String],
            required: [true, "At least one skill is required"],
        },

        experience: {
            type: Number,
            default: 0,
            min: 0,
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: 0,
        },

        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },

        employmentType: {
            type: String,
            enum: [
                "Full-Time",
                "Part-Time",
                "Internship",
                "Contract",
            ],
            default: "Full-Time",
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Job", jobSchema);