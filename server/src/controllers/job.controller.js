const jobService = require("../services/job.service");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// ==========================================
// Create Job
// ==========================================
exports.createJob = asyncHandler(async (req, res) => {
    const job = await jobService.createJob(
        req.body,
        req.user._id
    );

    res.status(201).json(
        new ApiResponse(
            201,
            "Job created successfully",
            job
        )
    );
});

// ==========================================
// Get All Jobs
// ==========================================
exports.getAllJobs = asyncHandler(async (req, res) => {
    const result = await jobService.getAllJobs(req.query);

    res.status(200).json(
        new ApiResponse(
            200,
            "Jobs fetched successfully",
            result
        )
    );
});

// ==========================================
// Get Job By ID
// ==========================================
exports.getJobById = asyncHandler(async (req, res) => {
    const job = await jobService.getJobById(req.params.id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Job fetched successfully",
            job
        )
    );
});

// ==========================================
// Get Recruiter's Jobs
// ==========================================
exports.getRecruiterJobs = asyncHandler(async (req, res) => {
    const jobs = await jobService.getRecruiterJobs(
        req.user._id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Recruiter jobs fetched successfully",
            jobs
        )
    );
});

// ==========================================
// Update Job
// ==========================================
exports.updateJob = asyncHandler(async (req, res) => {
    const job = await jobService.updateJob(
        req.params.id,
        req.user._id,
        req.body
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Job updated successfully",
            job
        )
    );
});

// ==========================================
// Delete Job
// ==========================================
exports.deleteJob = asyncHandler(async (req, res) => {
    await jobService.deleteJob(
        req.params.id,
        req.user._id
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Job deleted successfully",
            null
        )
    );
});