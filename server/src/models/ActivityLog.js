const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        action: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        metadata: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ActivityLog",
    activityLogSchema
);