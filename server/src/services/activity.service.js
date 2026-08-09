const ActivityLog = require("../models/ActivityLog");

const createActivity = async ({
    application,
    user = null,
    action,
    description,
    metadata = {},
}) => {
    return await ActivityLog.create({
        application,
        user,
        action,
        description,
        metadata,
    });
};

const getApplicationActivities = async (
    applicationId
) => {
    return await ActivityLog.find({
        application: applicationId,
    })
        .populate("user", "name role")
        .sort({ createdAt: -1 });
};

module.exports = {
    createActivity,
    getApplicationActivities,
};