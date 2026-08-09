const asyncHandler = require("../middleware/asyncHandler");
const candidateService = require("../services/candidate.service");
const ApiResponse = require("../utils/ApiResponse");

// Candidate Dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await candidateService.getDashboard(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Candidate dashboard fetched successfully",
            dashboard
        )
    );
});

// Get All Applications of Logged-in Candidate
exports.getMyApplications = asyncHandler(async (req, res) => {
    const applications = await candidateService.getMyApplications(
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
        await candidateService.getApplicationById(
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
// Withdraw Application
exports.withdrawApplication = asyncHandler(async (req, res) => {
    const result =
        await candidateService.withdrawApplication(
            req.params.applicationId,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            null
        )
    );
});
// Save Job
exports.saveJob = asyncHandler(async (req, res) => {
    const savedJob = await candidateService.saveJob(
        req.params.jobId,
        req.user._id
    );

    res.status(201).json(
        new ApiResponse(
            201,
            "Job saved successfully",
            savedJob
        )
    );
});
// Get Saved Jobs
exports.getSavedJobs = asyncHandler(async (req, res) => {
    const savedJobs = await candidateService.getSavedJobs(
        req.user._id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Saved jobs fetched successfully",
            savedJobs
        )
    );
});
// Remove Saved Job
exports.removeSavedJob = asyncHandler(async (req, res) => {
    const result =
        await candidateService.removeSavedJob(
            req.params.jobId,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            null
        )
    );
});
// ==========================================
// Get Candidate Profile
// ==========================================
exports.getProfile = asyncHandler(async (req, res) => {
    const profile = await candidateService.getProfile(
        req.user._id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Profile fetched successfully",
            profile
        )
    );
});

// ==========================================
// Update Candidate Profile
// ==========================================
exports.updateProfile = asyncHandler(async (req, res) => {
    const profile = await candidateService.updateProfile(
        req.user._id,
        req.body
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
            profile
        )
    );
});