const mongoose = require("mongoose");
const AIInterview = require("../models/AIInterview");
const Application = require("../models/Application");
const ApiError = require("../utils/ApiError");
const notificationService = require("./notification.service");
const { uploadResume: uploadFileToCloudinary } = require("../utils/cloudinary");

/**
 * Recruiter creates a new AI Interview session for a candidate's application
 */
const createAIInterviewSession = async (recruiterId, { applicationId, candidateId, jobId, type = "Mixed", config = {} }) => {
    if (applicationId && !mongoose.Types.ObjectId.isValid(applicationId)) {
        throw new ApiError(400, "Invalid applicationId format");
    }
    if (candidateId && !mongoose.Types.ObjectId.isValid(candidateId)) {
        throw new ApiError(400, "Invalid candidateId format");
    }
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid jobId format");
    }

    let application;
    if (applicationId) {
        application = await Application.findById(applicationId)
            .populate("candidate", "name email profile")
            .populate("job");
    } else if (candidateId && jobId) {
        application = await Application.findOne({ candidate: candidateId, job: jobId })
            .populate("candidate", "name email profile")
            .populate("job");
        if (!application) {
            // Create a minimal application record if none exists yet
            application = await Application.create({
                candidate: candidateId,
                job: jobId,
                status: "Applied",
            });
            application = await Application.findById(application._id)
                .populate("candidate", "name email profile")
                .populate("job");
        }
    }

    if (!application) {
        throw new ApiError(404, "Application or candidate/job relation not found");
    }

    if (application.job.recruiter.toString() !== recruiterId.toString()) {
        throw new ApiError(403, "Not authorized to schedule interview for this application");
    }

    // Check if waiting or in-progress session already exists
    const existing = await AIInterview.findOne({
        application: applicationId,
        status: { $in: ["Waiting", "InProgress"] },
    });

    if (existing) {
        return existing;
    }

    const aiInterview = await AIInterview.create({
        application: applicationId,
        candidate: application.candidate._id,
        job: application.job._id,
        recruiter: recruiterId,
        type,
        status: "Waiting",
        config: {
            duration: config.duration || 45,
            difficulty: config.difficulty || "Adaptive",
            focusAreas: config.focusAreas || [],
            questionCount: config.questionCount || 6,
            codingEnabled: config.codingEnabled !== undefined ? config.codingEnabled : true,
            systemDesignEnabled: config.systemDesignEnabled !== undefined ? config.systemDesignEnabled : false,
        },
        context: {
            resumeText: application.resumeText || "",
            atsScore: application.aiAnalysis?.atsScore || 0,
            matchingSkills: application.aiAnalysis?.matchingSkills || [],
            missingSkills: application.aiAnalysis?.missingSkills || [],
            strengths: application.aiAnalysis?.strengths || [],
            candidateProfile: application.candidate.profile || {},
            jobDescription: application.job.description || "",
            jobSkills: application.job.skills || [],
        },
    });

    // Send notification to candidate
    try {
        await notificationService.createNotification({
            recipient: application.candidate._id,
            sender: recruiterId,
            title: "AI Interview Scheduled",
            message: `An AI Video Interview has been set up for your application to "${application.job.title}".`,
            type: "Interview",
            data: {
                aiInterviewId: aiInterview._id,
                applicationId: application._id,
                jobId: application.job._id,
            },
        });
    } catch (err) {
        console.error("Notification creation error:", err.message);
    }

    return aiInterview;
};

/**
 * Candidate retrieves AI Interview session details before joining
 */
const getAIInterviewById = async (aiInterviewId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(aiInterviewId)) {
        throw new ApiError(400, "Invalid AI Interview ID format");
    }

    const interview = await AIInterview.findById(aiInterviewId)
        .populate("candidate", "name email profile")
        .populate("job", "title company description skills location salary")
        .populate("recruiter", "name email");

    if (!interview) {
        throw new ApiError(404, "AI Interview session not found");
    }

    const userIdStr = userId.toString();
    if (interview.candidate._id.toString() !== userIdStr && interview.recruiter._id.toString() !== userIdStr) {
        throw new ApiError(403, "Not authorized to access this AI interview session");
    }

    return interview;
};

/**
 * Candidate lists their scheduled/completed AI interviews
 */
const getCandidateAIInterviews = async (candidateId) => {
    return await AIInterview.find({ candidate: candidateId })
        .populate("job", "title company location")
        .sort({ createdAt: -1 })
        .lean();
};

/**
 * Recruiter lists AI interviews created by them
 */
const getRecruiterAIInterviews = async (recruiterId) => {
    return await AIInterview.find({ recruiter: recruiterId })
        .populate("candidate", "name email profile")
        .populate("job", "title company")
        .sort({ createdAt: -1 })
        .lean();
};

/**
 * Update session real-time metrics (confidence, eye contact, speaking speed)
 */
const updateSessionMetrics = async (aiInterviewId, metricsData) => {
    const interview = await AIInterview.findById(aiInterviewId);
    if (!interview) throw new ApiError(404, "Session not found");

    if (metricsData.confidence !== undefined) {
        interview.metrics.confidenceScores.push({
            timestamp: new Date(),
            score: metricsData.confidence,
        });
    }

    if (metricsData.speakingSpeed !== undefined) {
        interview.metrics.speakingSpeed.push({
            timestamp: new Date(),
            wpm: metricsData.speakingSpeed,
        });
    }

    if (metricsData.eyeContactScore !== undefined) {
        interview.metrics.eyeContactScore = metricsData.eyeContactScore;
    }

    if (metricsData.fillerWords) {
        interview.metrics.fillerWords.count += 1;
        if (!interview.metrics.fillerWords.words.includes(metricsData.fillerWords)) {
            interview.metrics.fillerWords.words.push(metricsData.fillerWords);
        }
    }

    await interview.save();
    return interview.metrics;
};

/**
 * Upload candidate interview session video recording
 */
const uploadSessionRecording = async (aiInterviewId, fileBuffer) => {
    const interview = await AIInterview.findById(aiInterviewId);
    if (!interview) throw new ApiError(404, "Interview not found");

    if (fileBuffer) {
        const uploaded = await uploadFileToCloudinary(fileBuffer);
        interview.recording = {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            duration: interview.config.duration * 60,
        };
        await interview.save();
    }

    return interview.recording;
};

/**
 * Recruiter cancels an AI Interview session
 */
const cancelAIInterviewSession = async (aiInterviewId, recruiterId) => {
    const interview = await AIInterview.findById(aiInterviewId);
    if (!interview) throw new ApiError(404, "AI Interview session not found");

    if (interview.recruiter.toString() !== recruiterId.toString()) {
        throw new ApiError(403, "Not authorized to cancel this interview session");
    }

    interview.status = "Abandoned";
    await interview.save();
    return interview;
};

/**
 * Recruiter reschedules or updates config of an AI Interview session
 */
const updateAIInterviewSession = async (aiInterviewId, recruiterId, { type, config }) => {
    const interview = await AIInterview.findById(aiInterviewId);
    if (!interview) throw new ApiError(404, "AI Interview session not found");

    if (interview.recruiter.toString() !== recruiterId.toString()) {
        throw new ApiError(403, "Not authorized to update this interview session");
    }

    if (type) interview.type = type;
    if (config) {
        interview.config = {
            ...interview.config,
            ...config,
        };
    }
    // Reset status back to Waiting if it was Abandoned or Expired
    if (interview.status === "Abandoned" || interview.status === "Expired") {
        interview.status = "Waiting";
    }

    await interview.save();
    return interview;
};

module.exports = {
    createAIInterviewSession,
    getAIInterviewById,
    getCandidateAIInterviews,
    getRecruiterAIInterviews,
    updateSessionMetrics,
    uploadSessionRecording,
    cancelAIInterviewSession,
    updateAIInterviewSession,
};
