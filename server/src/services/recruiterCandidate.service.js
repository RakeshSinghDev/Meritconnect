const Application = require("../models/Application");
const ApiError = require("../utils/ApiError");

const getCandidateDetails = async (applicationId, recruiterId) => {

    const application = await Application.findById(applicationId)

        .populate({
            path: "candidate",
            select: "name email phone profile",
        })

        .populate({
            path: "job",
            populate: {
                path: "recruiter",
                select: "_id",
            },
        });

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (
        application.job.recruiter._id.toString() !==
        recruiterId.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized"
        );
    }

    return {

        applicationId: application._id,

        status: application.status,

        appliedAt: application.createdAt,

        candidate: application.candidate,

        job: {
            id: application.job._id,
            title: application.job.title,
            company: application.job.company,
        },

        aiAnalysis: application.aiAnalysis,

        resume:
            (application.resume && application.resume.url)
                ? application.resume
                : (application.candidate?.profile?.resume || null),
    };
};

module.exports = {
    getCandidateDetails,
};