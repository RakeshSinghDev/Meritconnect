const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const recruiterCandidateService = require("../services/recruiterCandidate.service");

exports.getCandidateDetails = asyncHandler(
    async (req, res) => {

        const data =
            await recruiterCandidateService.getCandidateDetails(
                req.params.applicationId,
                req.user._id
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Candidate fetched successfully",
                data
            )
        );

    }
);