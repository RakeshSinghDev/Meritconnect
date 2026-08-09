const applicationService = require("../services/application.service");
const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// ==========================================
// Apply for Job
// ==========================================

exports.applyForJob = asyncHandler(async (req, res) => {

    const application = await applicationService.applyJob(
        req.params.jobId,
        req.user._id,
        req.body.coverLetter,
        req.file          // <-- NEW
    );

    res.status(201).json(
        new ApiResponse(
            201,
            "Application submitted successfully",
            application
        )
    );

});

// ==========================================
// Get My Applications
// ==========================================

exports.getMyApplications = asyncHandler(async (req, res) => {

    const applications =
        await applicationService.getMyApplications(
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

// ==========================================
// Recruiter
// ==========================================

exports.getApplicantsByJob = asyncHandler(async (req, res) => {

    const applicants =
        await applicationService.getApplicantsByJob(
            req.params.jobId,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Applicants fetched successfully",
            applicants
        )
    );

});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {

    const application =
        await applicationService.updateApplicationStatus(
            req.params.applicationId,
            req.user._id,
            req.body.status
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Application status updated successfully",
            application
        )
    );

});

exports.getApplicationById = asyncHandler(async (req, res) => {

    const application =
        await applicationService.getApplicationById(
            req.params.id,
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

exports.getApplicationResume = asyncHandler(async (req, res) => {

    const resumeData =
        await applicationService.getApplicationResume(
            req.params.applicationId || req.params.id,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Application resume details fetched successfully",
            resumeData
        )
    );

});

exports.getApplicationResumeFile = asyncHandler(async (req, res) => {

    const { fileBuffer, fileName, contentType } =
        await applicationService.getApplicationResumeFile(
            req.params.applicationId || req.params.id
        );

    res.setHeader("Content-Type", contentType);
    res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(fileBuffer);

});

