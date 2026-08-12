const mongoose = require("mongoose");

const jobSearchPreferenceSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        targetTitles: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        locations: [
            {
                type: String,
                trim: true,
            },
        ],

        allowRemote: {
            type: Boolean,
            default: true,
        },

        employmentTypes: [
            {
                type: String,
                enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
            },
        ],

        experienceMin: {
            type: Number,
            default: 0,
            min: 0,
        },

        experienceMax: {
            type: Number,
            default: 2,
            min: 0,
        },

        excludedTitles: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        enabled: {
            type: Boolean,
            default: true,
        },

        lastRunAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

jobSearchPreferenceSchema.index({ candidate: 1 }, { unique: true });

module.exports = mongoose.model("JobSearchPreference", jobSearchPreferenceSchema);
