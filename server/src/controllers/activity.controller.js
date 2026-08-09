const activityService = require("../services/activity.service");
const Application = require("../models/Application");

const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * ==========================================
 * Get Application Activity Timeline
 * ==========================================
 */
exports.getApplicationActivities =
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        const application =
            await Application.findById(id)
                .populate(
                    "candidate",
                    "_id"
                )
                .populate("job", "recruiter");

        if (!application) {
            throw new ApiError(
                404,
                "Application not found"
            );
        }

        // Authorization
        const isCandidate =
            application.candidate._id.toString() ===
            req.user._id.toString();

        const isRecruiter =
            application.job.recruiter.toString() ===
            req.user._id.toString();

        if (!isCandidate && !isRecruiter) {
            throw new ApiError(
                403,
                "You are not authorized to view this activity."
            );
        }

        const activities =
            await activityService.getApplicationActivities(
                id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Application activity fetched successfully.",
                activities
            )
        );
    });