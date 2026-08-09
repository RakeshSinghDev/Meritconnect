const Job = require("../models/Job");
const Application = require("../models/Application");

// Dashboard
const getDashboard = async (recruiterId) => {
    // Recruiter's jobs
    const jobs = await Job.find({
        recruiter: recruiterId,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id);

    // All applications with candidate and job details
    const applications = await Application.find({
        job: { $in: jobIds },
    })
        .populate("candidate", "name email")
        .populate("job", "title")
        .sort({ createdAt: -1 });

    // Dashboard statistics
    const totalJobs = jobs.length;
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
            candidateName: app.candidate?.name || "N/A",
            candidateEmail: app.candidate?.email || "N/A",
            jobTitle: app.job?.title || "N/A",
            status: app.status,
            atsScore: app.aiAnalysis?.atsScore || 0,
            appliedAt: app.createdAt,
        }));

    return {
        totalJobs,
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

// Update Application Status
const updateApplicationStatus = async (
    applicationId,
    recruiterId,
    status
) => {
    const validStatuses = [
        "Applied",
        "Reviewed",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired",
    ];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid application status");
    }

    const application = await Application.findById(applicationId)
        .populate("job");

    if (!application) {
        throw new Error("Application not found");
    }

    // Authorization check
    if (
        application.job.recruiter.toString() !== recruiterId.toString()
    ) {
        throw new Error("You are not authorized to update this application");
    }

    application.status = status;

    await application.save();

    return application;
};

// Get Applications for a Job
const getJobApplications = async (jobId, recruiterId) => {
    // Verify recruiter owns the job
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error("Job not found");
    }

    // Authorization check
    if (job.recruiter.toString() !== recruiterId.toString()) {
        throw new Error("You are not authorized to view these applications");
    }

    // Fetch applications
    const applications = await Application.find({
        job: jobId,
    })
        .populate("candidate", "name email profile")
        .sort({ createdAt: -1 });

    return applications;
};
// Get Single Application
const getApplicationById = async (
    applicationId,
    recruiterId
) => {
    const application =
        await Application.findById(applicationId)
            .populate(
                "candidate",
                "name email profile"
            )
            .populate(
                "job",
                "title company recruiter"
            );

    if (!application) {
        throw new Error("Application not found");
    }

    // Authorization
    if (
        application.job.recruiter.toString() !==
        recruiterId.toString()
    ) {
        throw new Error(
            "You are not authorized to view this application"
        );
    }

    return application;
};

module.exports = {
    getDashboard,
    updateApplicationStatus,
    getJobApplications,
    getApplicationById,
};
