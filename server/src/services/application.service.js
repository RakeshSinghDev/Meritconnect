const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const ApiError = require("../utils/ApiError");

const notificationService = require("./notification.service");
const activityService = require("./activity.service");
const emailService = require("./email.service");

const { downloadResume } = require("../utils/downloadResume");
const { extractText } = require("../utils/pdfParser");
const { analyzeResume } = require("./ai.service");

/**
 * ==========================================
 * Candidate Applies for a Job
 * ==========================================
 */
const applyJob = async (jobId, candidateId) => {
    // ==========================
    // Check Job
    // ==========================
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Recruiter cannot apply to own job
    if (job.recruiter.toString() === candidateId.toString()) {
        throw new ApiError(
            400,
            "You cannot apply to your own job."
        );
    }

    // ==========================
    // Prevent Duplicate Application
    // ==========================
    const existingApplication =
        await Application.findOne({
            candidate: candidateId,
            job: jobId,
        });

    if (existingApplication) {
        throw new ApiError(
            409,
            "You have already applied for this job."
        );
    }

    // ==========================
    // Get Candidate
    // ==========================
    const candidate = await User.findById(candidateId);

    if (!candidate) {
        throw new ApiError(
            404,
            "Candidate not found"
        );
    }

    if (!candidate.profile?.resume?.url) {
        throw new ApiError(
            400,
            "Please upload your resume before applying."
        );
    }

    // ==========================
    // Create Application
    // ==========================
    const application =
        await Application.create({
            candidate: candidateId,
            job: jobId,
            coverLetter: "",
            resume: {
                url: candidate.profile.resume.url,
                publicId:
                    candidate.profile.resume.publicId,
                fileName:
                    candidate.profile.resume.fileName,
            },
        });

    // ==========================
    // Activity Log
    // Application Submitted
    // ==========================
    await activityService.createActivity({
        application: application._id,
        user: candidate._id,
        action: "APPLICATION_SUBMITTED",
        description:
            "Candidate submitted the application.",
    });

    let resumeText = "";

    try {
        // ==========================
        // Download Resume
        // ==========================
        const resumeBuffer =
            await downloadResume(
                candidate.profile.resume.url
            );

        // ==========================
        // Extract Resume Text
        // ==========================
        resumeText =
            await extractText(resumeBuffer);
            console.log("Resume Length:", resumeText.length);

            console.log(resumeText.substring(0,500));

        application.resumeText = resumeText;

        // ==========================
        // Activity Log
        // Resume Parsed
        // ==========================
        await activityService.createActivity({
            application: application._id,
            action: "RESUME_PARSED",
            description:
                "Resume parsed successfully.",
        });

        // ==========================
        // Prepare Job Description
        // ==========================
        const jobDescription = `
Title: ${job.title}

Company: ${job.company}

Location: ${job.location || ""}

Description:
${job.description}

Requirements:
${Array.isArray(job.requirements)
                ? job.requirements.join(", ")
                : job.requirements || ""
            }

Skills:
${Array.isArray(job.skills)
                ? job.skills.join(", ")
                : ""
            }
`;

        // ==========================
        // AI Resume Analysis
        // ==========================
        console.log("Resume extracted:");
        console.log(resumeText.substring(0, 300));

        console.log("Calling Gemini...");
        const aiResult =
            await analyzeResume(
                resumeText,
                jobDescription
            );

        console.log("Gemini Result:");
        console.log(aiResult);

        // ==========================
        // Save AI Analysis
        // ==========================
        application.aiAnalysis = {
            overallScore: aiResult.overallScore || aiResult.atsScore || 0,

            atsScore: aiResult.atsScore || 0,

            recommendation:
                aiResult.recommendation || "Consider",

            summary:
                aiResult.summary || "",

            strengths:
                aiResult.strengths || [],

            matchedSkills:
                aiResult.matchedSkills ||
                aiResult.matchingSkills ||
                [],

            missingSkills:
                aiResult.missingSkills || [],

            experience:
                aiResult.experience || {
                    candidate: 0,
                    required: 0,
                },

            education:
                aiResult.education || "Not Available",

            projectsScore:
                aiResult.projectsScore || 0,

            analyzedAt: new Date(),
        };
        // ==========================
        // Activity Log
        // AI Analysis Completed
        // ==========================
        await activityService.createActivity({
            application: application._id,
            action: "AI_ANALYSIS_COMPLETED",
            description:
                "AI resume analysis completed.",
            metadata: {
                atsScore: aiResult.atsScore || 0,
            },
        });

        // Save Application
        await application.save();
        console.log(application.aiAnalysis);
    } catch (error) {
         console.error("======================");

    console.error(error);

    console.error(error.stack);

    console.error("======================");


        application.resumeText = resumeText;

        application.aiAnalysis = {
            overallScore: 0,

            atsScore: 0,

            recommendation: "Reject",

            summary: "AI analysis could not be completed.",

            strengths: [],

            matchedSkills: [],

            missingSkills: [],

            experience: {
                candidate: 0,
                required: 0,
            },

            education: "Not Available",

            projectsScore: 0,

            analyzedAt: new Date(),
        };

        await application.save();
    }

    // ==========================
    // Notify Recruiter
    // ==========================
    try {
        await notificationService.createNotification({
            recipient: job.recruiter,
            sender: candidate._id,
            title: "New Job Application",
            message: `${candidate.name} applied for "${job.title}".`,
            type: "Application",
            data: {
                applicationId: application._id,
                jobId: job._id,
            },
        });
    } catch (error) {
        console.error(
            "Notification Creation Failed:",
            error.message
        );
    }

    // ==========================
    // Send Confirmation Email
    // ==========================
    try {
        await emailService.sendApplicationSubmittedEmail(
            candidate,
            job
        );
    } catch (error) {
        console.error(
            "Application Email Failed:",
            error.message
        );
    }

    // ==========================
    // Return Populated Application
    // ==========================
    return await application.populate([
        {
            path: "candidate",
            select: "name email",
        },
        {
            path: "job",
            select:
                "title company location salary recruiter",
        },
    ]);
};

/**
 * ==========================================
 * Candidate Views Own Applications
 * ==========================================
 */
const getMyApplications = async (candidateId) => {
    return await Application.find({
        candidate: candidateId,
    })
        .populate({
            path: "job",
            populate: {
                path: "recruiter",
                select: "name email",
            },
        })
        .sort({
            createdAt: -1,
        });
};

/**
 * ==========================================
 * Candidate Views Single Application
 * ==========================================
 */
const getApplicationById = async (
    applicationId,
    candidateId
) => {
    const application =
        await Application.findById(
            applicationId
        )
            .populate({
                path: "job",
                populate: {
                    path: "recruiter",
                    select: "name email",
                },
            })
            .populate({
                path: "candidate",
                select: "name email profile",
            });

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    if (
        application.candidate._id.toString() !==
        candidateId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to view this application."
        );
    }

    return application;
};
/**
 * ==========================================
 * Recruiter Views Applicants for a Job
 * ==========================================
 */
const getApplicantsByJob = async (
    jobId,
    recruiterId
) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    if (
        job.recruiter.toString() !==
        recruiterId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to view applicants for this job."
        );
    }

    return await Application.find({
        job: jobId,
    })
        .populate({
            path: "candidate",
            select: "name email profile",
        })
        .sort({
            createdAt: -1,
        });
};

/**
 * ==========================================
 * Recruiter Updates Application Status
 * ==========================================
 */
const updateApplicationStatus = async (
    applicationId,
    recruiterId,
    status
) => {
    const allowedStatuses = [
        "Applied",
        "Reviewed",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired",
    ];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid application status."
        );
    }

    const application =
        await Application.findById(
            applicationId
        ).populate([
            {
                path: "job",
                select:
                    "title company recruiter",
            },
            {
                path: "candidate",
                select: "name email",
            },
        ]);

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
            "You are not authorized to update this application."
        );
    }

    // Avoid unnecessary update
    if (application.status === status) {
        throw new ApiError(
            400,
            `Application is already "${status}".`
        );
    }

    application.status = status;

    await application.save();

    // ==========================
    // Activity Log
    // ==========================
    try {
        await activityService.createActivity({
            application: application._id,
            user: recruiterId,
            action: "STATUS_UPDATED",
            description: `Application status changed to "${status}".`,
            metadata: {
                status,
            },
        });
    } catch (error) {
        console.error(
            "Activity Log Failed:",
            error.message
        );
    }

    // ==========================
    // Candidate Notification
    // ==========================
    try {
        await notificationService.createNotification({
            recipient:
                application.candidate._id,
            sender: recruiterId,
            title:
                "Application Status Updated",
            message: `Your application for "${application.job.title}" has been updated to "${status}".`,
            type: "Application",
            data: {
                applicationId:
                    application._id,
                jobId:
                    application.job._id,
                status,
            },
        });
    } catch (error) {
        console.error(
            "Notification Creation Failed:",
            error.message
        );
    }

    // ==========================
    // Email Notification
    // ==========================
    try {
        await emailService.sendApplicationStatusEmail(
            application.candidate,
            application.job,
            status
        );
    } catch (error) {
        console.error(
            "Status Email Failed:",
            error.message
        );
    }

    return application;
};
/**
 * ==========================================
 * Candidate Withdraws Application
 * ==========================================
 */
const withdrawApplication = async (
    applicationId,
    candidateId
) => {
    const application =
        await Application.findById(
            applicationId
        ).populate({
            path: "job",
            select: "title recruiter",
        });

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    // Authorization
    if (
        application.candidate.toString() !==
        candidateId.toString()
    ) {
        throw new ApiError(
            403,
            "You can only withdraw your own application."
        );
    }

    // Cannot withdraw after hiring
    if (application.status === "Hired") {
        throw new ApiError(
            400,
            "Cannot withdraw a hired application."
        );
    }

    // Cannot withdraw after interview scheduled
    if (application.status === "Interview") {
        throw new ApiError(
            400,
            "Cannot withdraw an application after an interview has been scheduled."
        );
    }

    // ==========================
    // Activity Log
    // ==========================
    try {
        await activityService.createActivity({
            application: application._id,
            user: candidateId,
            action: "APPLICATION_WITHDRAWN",
            description:
                "Candidate withdrew the application.",
        });
    } catch (error) {
        console.error(
            "Activity Log Failed:",
            error.message
        );
    }

    // ==========================
    // Notify Recruiter
    // ==========================
    try {
        await notificationService.createNotification({
            recipient: application.job.recruiter,
            sender: candidateId,
            title: "Application Withdrawn",
            message:
                "A candidate has withdrawn their job application.",
            type: "Application",
            data: {
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

    await application.deleteOne();

    return {
        message:
            "Application withdrawn successfully.",
    };
};

/**
 * ==========================================
 * Module Exports
 * ==========================================
 */
module.exports = {
    // Candidate
    applyJob,
    getMyApplications,
    getApplicationById,
    withdrawApplication,

    // Recruiter
    getApplicantsByJob,
    updateApplicationStatus,
    getApplicationResume,
    getApplicationResumeFile,
};

/**
 * ==========================================
 * Fetch Application Resume File Stream
 * ==========================================
 */
async function getApplicationResumeFile(applicationId) {
    console.log(`\n==========================================`);
    console.log(`[ResumeFile] Fetching resume stream for Application ID: ${applicationId}`);

    const application = await Application.findById(applicationId).populate("candidate");

    if (!application) {
        console.error(`[ResumeFile] Error: Application ${applicationId} not found in MongoDB.`);
        throw new ApiError(404, "Application record not found.");
    }

    let rawResumePath =
        application.resume?.url ||
        application.candidate?.profile?.resume?.url ||
        "";

    console.log(`[ResumeFile] 1. MongoDB resumePath: "${rawResumePath}"`);

    if (!rawResumePath) {
        console.error(`[ResumeFile] Error: No resume path stored in MongoDB for application ${applicationId}.`);
        throw new ApiError(404, "No uploaded resume file found for this application.");
    }

    // Convert Windows backslashes (\) to standard URL slashes (/)
    const normalizedResumePath = rawResumePath.replace(/\\/g, "/");
    console.log(`[ResumeFile] 2. Normalized Path: "${normalizedResumePath}"`);

    let fileBuffer;
    let fileExists = false;

    if (normalizedResumePath.startsWith("http://") || normalizedResumePath.startsWith("https://")) {
        console.log(`[ResumeFile] 3. Fetching remote PDF from Cloudinary/URL: ${normalizedResumePath}`);
        try {
            fileBuffer = await downloadResume(normalizedResumePath);
            fileExists = Boolean(fileBuffer && fileBuffer.length > 0);
            console.log(`[ResumeFile] 4. Remote Download Success: ${fileBuffer.length} bytes fetched.`);
        } catch (downloadErr) {
            console.error(`[ResumeFile] 4. Remote Download Error:`, downloadErr.message);
            throw new ApiError(500, `Failed to download resume file from Cloudinary: ${downloadErr.message}`);
        }
    } else {
        const fs = require("fs");
        const path = require("path");

        const localPath = path.isAbsolute(normalizedResumePath)
            ? normalizedResumePath
            : path.join(__dirname, "../../", normalizedResumePath);

        fileExists = fs.existsSync(localPath);
        console.log(`[ResumeFile] 3. Local File Path: "${localPath}"`);
        console.log(`[ResumeFile] 4. fs.existsSync check: ${fileExists}`);

        if (!fileExists) {
            console.error(`[ResumeFile] Error: Local resume file does not exist on disk at "${localPath}".`);
            throw new ApiError(404, `Resume file physically missing from server storage.`);
        }

        fileBuffer = fs.readFileSync(localPath);
        console.log(`[ResumeFile] 5. Read ${fileBuffer.length} bytes from disk.`);
    }

    const rawFileName =
        application.resume?.fileName ||
        application.candidate?.profile?.resume?.fileName ||
        "candidate_resume.pdf";

    const contentType = rawFileName.toLowerCase().endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";

    console.log(`[ResumeFile] 6. Final Content-Type: "${contentType}"`);
    console.log(`==========================================\n`);

    return {
        fileBuffer,
        fileName: rawFileName,
        contentType,
        resumePath: normalizedResumePath,
        fileExists,
    };
}



/**
 * ==========================================
 * Fetch Application Resume Details
 * ==========================================
 */
async function getApplicationResume(applicationId, userId) {
    const application = await Application.findById(applicationId)
        .populate({
            path: "candidate",
            select: "name email profile",
        })
        .populate({
            path: "job",
            select: "title company recruiter",
        });

    if (!application) {
        throw new ApiError(404, "Application record not found.");
    }

    const resumeUrl =
        application.resume?.url ||
        application.candidate?.profile?.resume?.url ||
        "";

    const fileName =
        application.resume?.fileName ||
        application.candidate?.profile?.resume?.fileName ||
        "resume.pdf";

    return {
        applicationId: application._id,
        candidateName: application.candidate?.name || "Candidate",
        email: application.candidate?.email || "",
        jobTitle: application.job?.title || "",
        status: application.status || "Applied",
        atsScore:
            application.aiAnalysis?.atsScore ??
            application.aiAnalysis?.overallScore ??
            0,
        resumeUrl: resumeUrl,
        fileName: fileName,
        uploadedAt: application.createdAt,
        candidate: application.candidate,
        job: application.job,
        aiAnalysis: application.aiAnalysis,
    };
}