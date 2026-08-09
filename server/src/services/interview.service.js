const Interview = require("../models/Interview");
const Application = require("../models/Application");
const ApiError = require("../utils/ApiError");
const emailService = require("./email.service");
const notificationService = require("./notification.service");

// ==========================================
// Schedule Interview
// ==========================================
const scheduleInterview = async (
    recruiterId,
    interviewData
) => {
    const {
        applicationId,
        interviewDate,
        duration,
        mode,
        meetingLink,
        venue,
        notes,
    } = interviewData;

    // Find application
    const application = await Application.findById(
        applicationId
    )
        .populate("candidate", "name email")
        .populate("job", "title company recruiter");

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    // Authorization
    if (
        application.job.recruiter.toString() !==
        recruiterId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to schedule interview."
        );
    }

    // Prevent duplicate scheduled interview
    const existingInterview =
        await Interview.findOne({
            application: applicationId,
            status: "Scheduled",
        });

    if (existingInterview) {
        throw new ApiError(
            400,
            "Interview already scheduled for this application."
        );
    }

    // Create interview
    const interview = await Interview.create({
        application: application._id,
        recruiter: recruiterId,
        candidate: application.candidate._id,
        job: application.job._id,
        interviewDate,
        duration,
        mode,
        meetingLink,
        venue,
        notes,
    });

    // Update application status
    application.status = "Interview";
    await application.save();

    // ==========================
    // Create Notification
    // ==========================
    try {
        await notificationService.createNotification({
            recipient: application.candidate._id,
            sender: recruiterId,
            title: "Interview Scheduled",
            message: `Your interview for "${application.job.title}" has been scheduled.`,
            type: "Interview",
            data: {
                interviewId: interview._id,
                applicationId: application._id,
                jobId: application.job._id,
            },
        });
    } catch (error) {
        console.error(
            "Notification Creation Failed:",
            error.message
        );
    }

    // Send Email
    try {
        await emailService.sendInterviewInvitationEmail(
            application.candidate,
            application.job,
            interview
        );
    } catch (error) {
        console.error(
            "Interview Email Failed:",
            error.message
        );
    }

    return await interview.populate([
        {
            path: "candidate",
            select: "name email",
        },
        {
            path: "job",
            select: "title company",
        },
    ]);
};

// ==========================================
// Recruiter Interviews
// ==========================================
const getRecruiterInterviews = async (
    recruiterId
) => {
    return await Interview.find({
        recruiter: recruiterId,
    })
        .populate("candidate", "name email")
        .populate("job", "title company")
        .sort({
            interviewDate: 1,
        });
};

// ==========================================
// Candidate Interviews
// ==========================================
const getCandidateInterviews = async (
    candidateId
) => {
    return await Interview.find({
        candidate: candidateId,
    })
        .populate("job", "title company")
        .populate("recruiter", "name email")
        .sort({
            interviewDate: 1,
        });
};

// ==========================================
// Cancel Interview
// ==========================================
const cancelInterview = async (
    interviewId,
    recruiterId
) => {
    const interview = await Interview.findById(
        interviewId
    ).populate("job", "title");

    if (!interview) {
        throw new ApiError(
            404,
            "Interview not found"
        );
    }

    if (
        interview.recruiter.toString() !==
        recruiterId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized."
        );
    }

    interview.status = "Cancelled";

    await interview.save();

    // ==========================
    // Create Notification
    // ==========================
    try {
        await notificationService.createNotification({
            recipient: interview.candidate,
            sender: recruiterId,
            title: "Interview Cancelled",
            message: "Your scheduled interview has been cancelled.",
            type: "Interview",
            data: {
                interviewId: interview._id,
            },
        });
    } catch (error) {
        console.error(
            "Notification Creation Failed:",
            error.message
        );
    }

    return interview;
};

module.exports = {
    scheduleInterview,
    getRecruiterInterviews,
    getCandidateInterviews,
    cancelInterview,
};