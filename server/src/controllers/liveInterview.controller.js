const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const InterviewEngine = require("../services/interview/InterviewEngine");

exports.startInterview = asyncHandler(async (req, res) => {

    const result = await InterviewEngine.start(
        req.params.id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Interview started successfully",
            result
        )
    );

});

exports.submitAnswer = asyncHandler(async (req, res) => {

    const { answer } = req.body;

    const result =
        await InterviewEngine.submitAnswer(
            req.params.id,
            answer
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Answer submitted successfully",
            result
        )
    );

});

exports.completeInterview = asyncHandler(async (req, res) => {

    const report =
        await InterviewEngine.complete(
            req.params.id
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Interview completed",
            report
        )
    );

});