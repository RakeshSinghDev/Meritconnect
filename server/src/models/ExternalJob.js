const mongoose = require("mongoose");

const externalJobSchema = new mongoose.Schema(
    {
        normalizedId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        externalId: {
            type: String,
            required: true,
        },

        source: {
            type: String,
            enum: ["greenhouse", "lever", "ashby"],
            required: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
        },

        companySlug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            default: "",
            trim: true,
        },

        remote: {
            type: Boolean,
            default: false,
        },

        description: {
            type: String,
            default: "",
        },

        requirements: {
            type: String,
            default: "",
        },

        skills: [
            {
                type: String,
                trim: true,
            },
        ],

        employmentType: {
            type: String,
            default: "Full-Time",
        },

        experienceLevel: {
            type: String,
            default: "",
        },

        postedAt: {
            type: Date,
            default: null,
        },

        applicationUrl: {
            type: String,
            required: true,
        },

        rawData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

externalJobSchema.index({ source: 1, postedAt: -1 });
externalJobSchema.index({ companySlug: 1 });

module.exports = mongoose.model("ExternalJob", externalJobSchema);
