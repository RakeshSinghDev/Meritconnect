const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const aiInterviewService = require("../services/aiInterview.service");

/**
 * Generate AI Interview Questions
 * POST /api/v1/ai/:id/interview-questions
 * Access: Recruiter
 */
exports.generateInterviewQuestions = asyncHandler(
    async (req, res) => {
        const {
            difficulty = "Medium",
            technicalQuestions = 5,
            behavioralQuestions = 3,
            codingQuestions = 2,
            interviewDuration = 60,
            focusAreas = [],
        } = req.body;

        const questions =
            await aiInterviewService.generateInterviewQuestions(
                req.params.id,
                {
                    difficulty,
                    technicalQuestions,
                    behavioralQuestions,
                    codingQuestions,
                    interviewDuration,
                    focusAreas,
                }
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Interview questions generated successfully",
                questions
            )
        );
    }
);
exports.createInterviewSession =
    asyncHandler(async (req, res) => {

        const session =
            await aiInterviewService
                .createInterviewSession(

                    req.params.applicationId,

                    req.user._id,

                    req.body

                );

        return res.status(201).json(

            new ApiResponse(

                201,

                "Interview session created successfully",

                session

            )

        );

    });
exports.startInterview = asyncHandler(async (req, res) => {

    const result = await aiInterviewService.startInterview(
        req.params.sessionId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Interview started successfully.",
            result
        )
    );

});
exports.submitAnswer = asyncHandler(async (req, res) => {

    const result =
        await aiInterviewService.submitAnswer(

            req.params.sessionId,

            req.body.answer

        );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Answer evaluated",

            result

        )

    );

});
exports.endInterview = asyncHandler(async (req, res) => {

    const result =
        await aiInterviewService.endInterview(
            req.params.sessionId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Interview completed",
            result
        )
    );

});
exports.getInterviewReport = asyncHandler(async (req, res) => {

    const report =
        await aiInterviewService.getInterviewReport(
            req.params.sessionId
        );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Interview report",

            report

        )

    );

});