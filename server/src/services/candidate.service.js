const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
// Candidate Dashboard
const getDashboard = async (candidateId) => {
    // Candidate's applications
    const applications = await Application.find({
        candidate: candidateId,
    })
        .populate({
            path: "job",
            select: "title company",
        })
        .sort({ createdAt: -1 });

    // Statistics
    const totalApplications = applications.length;

    const applied = applications.filter(
        (app) => app.status === "Applied"
    ).length;

    const reviewed = applications.filter(
        (app) => app.status === "Reviewed"
    ).length;

    const shortlisted = applications.filter(
        (app) => app.status === "Shortlisted"
    ).length;

    const interview = applications.filter(
        (app) => app.status === "Interview"
    ).length;

    const rejected = applications.filter(
        (app) => app.status === "Rejected"
    ).length;

    const hired = applications.filter(
        (app) => app.status === "Hired"
    ).length;

    // Average ATS Score
    const scoredApplications = applications.filter(
        (app) =>
            app.aiAnalysis &&
            typeof app.aiAnalysis.atsScore === "number"
    );

    let averageATSScore = 0;

    if (scoredApplications.length > 0) {
        const totalScore = scoredApplications.reduce(
            (sum, app) => sum + app.aiAnalysis.atsScore,
            0
        );

        averageATSScore = Math.round(
            totalScore / scoredApplications.length
        );
    }

    // Recent Applications
    const recentApplications = applications
        .slice(0, 5)
        .map((app) => ({
            applicationId: app._id,
            jobTitle: app.job?.title || "N/A",
            company: app.job?.company || "N/A",
            status: app.status,
            atsScore: app.aiAnalysis?.atsScore || 0,
            appliedAt: app.createdAt,
        }));

    return {
        totalApplications,
        applied,
        reviewed,
        shortlisted,
        interview,
        rejected,
        hired,
        averageATSScore,
        recentApplications,
    };
};

// Get All Applications of Logged-in Candidate
const getMyApplications = async (candidateId) => {
    const applications = await Application.find({
        candidate: candidateId,
    })
        .populate({
            path: "job",
            select:
                "title company location jobType employmentType salary recruiter",
        })
        .sort({ createdAt: -1 });

    return applications.map((app) => ({
        applicationId: app._id,
        jobId: app.job?._id,
        jobTitle: app.job?.title || "N/A",
        company: app.job?.company || "N/A",
        location: app.job?.location || "N/A",
        jobType: app.job?.jobType || "N/A",
        employmentType: app.job?.employmentType || "N/A",
        salary: app.job?.salary || null,
        status: app.status,
        atsScore: app.aiAnalysis?.atsScore || 0,
        appliedAt: app.createdAt,
    }));
};
// Get Single Application
const getApplicationById = async (
    applicationId,
    candidateId
) => {
    const application = await Application.findById(applicationId)
        .populate({
            path: "job",
        });

    if (!application) {
        throw new Error("Application not found");
    }

    // Authorization
    if (
        application.candidate.toString() !==
        candidateId.toString()
    ) {
        throw new Error(
            "You are not authorized to view this application"
        );
    }

    return application;
};
// Withdraw Application
const withdrawApplication = async (
    applicationId,
    candidateId
) => {
    const application = await Application.findById(applicationId);

    if (!application) {
        throw new Error("Application not found");
    }

    // Authorization
    if (
        application.candidate.toString() !==
        candidateId.toString()
    ) {
        throw new Error(
            "You are not authorized to withdraw this application"
        );
    }

    // Allow withdrawal only if still applied
    if (application.status !== "Applied") {
        throw new Error(
            `Cannot withdraw application. Current status is "${application.status}".`
        );
    }

    await Application.findByIdAndDelete(applicationId);

    return {
        message: "Application withdrawn successfully",
    };
};
// Save a Job
const saveJob = async (jobId, candidateId) => {
    // Check if job exists
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error("Job not found");
    }

    // Check if already saved
    const alreadySaved = await SavedJob.findOne({
        candidate: candidateId,
        job: jobId,
    });

    if (alreadySaved) {
        throw new Error("Job already saved");
    }

    const savedJob = await SavedJob.create({
        candidate: candidateId,
        job: jobId,
    });

    return savedJob;
};
// Get Saved Jobs
const getSavedJobs = async (candidateId) => {
    const savedJobs = await SavedJob.find({
        candidate: candidateId,
    })
        .populate({
            path: "job",
            select:
                "title company location employmentType salary recruiter createdAt",
        })
        .sort({ createdAt: -1 });

    return savedJobs.map((item) => ({
        savedJobId: item._id,
        jobId: item.job?._id,
        title: item.job?.title || "N/A",
        company: item.job?.company || "N/A",
        location: item.job?.location || "N/A",
        employmentType: item.job?.employmentType || "N/A",
        salary: item.job?.salary || null,
        savedAt: item.createdAt,
    }));
};
// Remove Saved Job
const removeSavedJob = async (jobId, candidateId) => {
    const savedJob = await SavedJob.findOne({
        candidate: candidateId,
        job: jobId,
    });

    if (!savedJob) {
        throw new Error("Saved job not found");
    }

    await savedJob.deleteOne();

    return {
        message: "Saved job removed successfully",
    };
};

// ==========================================
// Get Candidate Profile
// ==========================================
const getProfile = async (candidateId) => {
    const user = await User.findById(candidateId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "Candidate not found");
    }

    return user;
};

// ==========================================
// Update Candidate Profile
// ==========================================
const updateProfile = async (candidateId, profileData) => {
    const user = await User.findById(candidateId);

    if (!user) {
        throw new ApiError(404, "Candidate not found");
    }

    // Basic fields
    if (profileData.name !== undefined) {
        user.name = profileData.name;
    }

    // Profile fields
    if (profileData.bio !== undefined)
        user.profile.bio = profileData.bio;

    if (profileData.phone !== undefined)
        user.profile.phone = profileData.phone;

    if (profileData.location !== undefined)
        user.profile.location = profileData.location;

    if (profileData.education !== undefined)
        user.profile.education = profileData.education;

    if (profileData.college !== undefined)
        user.profile.college = profileData.college;

    if (profileData.experience !== undefined)
        user.profile.experience = Number(profileData.experience);

    if (profileData.currentCompany !== undefined)
        user.profile.currentCompany = profileData.currentCompany;

    if (profileData.currentPosition !== undefined)
        user.profile.currentPosition = profileData.currentPosition;

    if (profileData.github !== undefined)
        user.profile.github = profileData.github;

    if (profileData.linkedin !== undefined)
        user.profile.linkedin = profileData.linkedin;

    if (profileData.portfolio !== undefined)
        user.profile.portfolio = profileData.portfolio;

    if (profileData.skills !== undefined) {
        user.profile.skills = Array.isArray(profileData.skills)
            ? profileData.skills
            : profileData.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
    }

    await user.save();

    return await User.findById(candidateId).select("-password -refreshToken");
};
module.exports = {
    getDashboard,
    getMyApplications,
    getApplicationById,
    withdrawApplication,
    saveJob,
    getSavedJobs,
    removeSavedJob,

    getProfile,
    updateProfile,
};
