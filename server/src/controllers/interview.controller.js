const interviewService = require("../services/interview.service");

const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// ==========================================
// Schedule Interview
// ==========================================
exports.scheduleInterview = asyncHandler(async (req, res) => {
    const interview =
        await interviewService.scheduleInterview(
            req.user._id,
            req.body
        );

    res.status(201).json(
        new ApiResponse(
            201,
            "Interview scheduled successfully",
            interview
        )
    );
});

// ==========================================
// Recruiter Interviews
// ==========================================
exports.getRecruiterInterviews = asyncHandler(
    async (req, res) => {
        const interviews =
            await interviewService.getRecruiterInterviews(
                req.user._id
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Recruiter interviews fetched successfully",
                interviews
            )
        );
    }
);

// ==========================================
// Candidate Interviews
// ==========================================
exports.getCandidateInterviews = asyncHandler(
    async (req, res) => {
        const interviews =
            await interviewService.getCandidateInterviews(
                req.user._id
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Candidate interviews fetched successfully",
                interviews
            )
        );
    }
);

// ==========================================
// Cancel Interview
// ==========================================
exports.cancelInterview = asyncHandler(async (req, res) => {
    const interview =
        await interviewService.cancelInterview(
            req.params.id,
            req.user._id
        );

    res.status(200).json(
        new ApiResponse(
            200,
            "Interview cancelled successfully",
            interview
        )
    );
});