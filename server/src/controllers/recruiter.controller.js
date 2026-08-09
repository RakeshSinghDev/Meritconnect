const asyncHandler = require("../middleware/asyncHandler");
const recruiterService = require("../services/recruiter.service");
const ApiResponse = require("../utils/ApiResponse");

exports.getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await recruiterService.getDashboard(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard fetched successfully",
            dashboard
        )
    );
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const application =
        await recruiterService.updateApplicationStatus(
            req.params.applicationId,
            req.user._id,
            status
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Application status updated successfully",
            application
        )
    );
});

// NEW CONTROLLER
exports.getJobApplications = asyncHandler(async (req, res) => {
    const applications =
        await recruiterService.getJobApplications(
            req.params.jobId,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Applications fetched successfully",
            applications
        )
    );
});
// Get Single Application
exports.getApplicationById = asyncHandler(async (req, res) => {
    const application =
        await recruiterService.getApplicationById(
            req.params.applicationId,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Application fetched successfully",
            application
        )
    );
});