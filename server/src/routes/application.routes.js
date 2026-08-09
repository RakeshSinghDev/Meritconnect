const express = require("express");

const router = express.Router();

const applicationController = require("../controllers/application.controller");
const activityController = require("../controllers/activity.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload.middleware");

const {
    applyJobValidator,
    updateStatusValidator,
} = require("../validators/application.validator");

// ==========================================
// Candidate Routes
// ==========================================

// Apply for a job
router.post(
    "/:jobId",
    protect,
    authorize("candidate"),
    upload.single("resume"),
    applyJobValidator,
    validate,
    applicationController.applyForJob
);

// View my applications
router.get(
    "/my-applications",
    protect,
    authorize("candidate"),
    applicationController.getMyApplications
);

// ==========================================
// Recruiter Routes
// ==========================================

// View applicants for a job
router.get(
    "/job/:jobId",
    protect,
    authorize("recruiter"),
    applicationController.getApplicantsByJob
);

// Update application status
router.patch(
    "/:applicationId/status",
    protect,
    authorize("recruiter"),
    updateStatusValidator,
    validate,
    applicationController.updateApplicationStatus
);
router.get(
    "/:applicationId/resume",
    protect,
    applicationController.getApplicationResume
);
router.get(
    "/:applicationId/resume-file",
    protect,
    applicationController.getApplicationResumeFile
);


router.get(
    "/:id",
    protect,
    authorize("candidate"),
    applicationController.getApplicationById
);
router.get(
    "/:id/activity",
    protect,
    activityController.getApplicationActivities
);
module.exports = router;