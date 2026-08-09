const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const resumeService = require("../services/resume.service");

/**
 * Upload Resume
 */
exports.uploadResume = asyncHandler(async (req, res) => {
    const resume = await resumeService.uploadResume(
        req.user._id,
        req.file
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Resume uploaded successfully",
            resume
        )
    );
});

/**
 * Get Resume
 */
exports.getResume = asyncHandler(async (req, res) => {
    const resume = await resumeService.getResume(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Resume fetched successfully",
            resume
        )
    );
});
exports.deleteResume = asyncHandler(async (req, res) => {
    await resumeService.deleteResume(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Resume deleted successfully",
            null
        )
    );
});