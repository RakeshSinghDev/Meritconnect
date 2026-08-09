const express = require("express");
const router = express.Router();

const recruiterController = require("../controllers/recruiter.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

const recruiterCandidateController =
    require("../controllers/recruiterCandidate.controller");

// Dashboard
router.get(
    "/dashboard",
    protect,
    authorize("recruiter"),
    recruiterController.getDashboard
);

// Get all applications for a job
router.get(
    "/jobs/:jobId/applications",
    protect,
    authorize("recruiter"),
    recruiterController.getJobApplications
);

// Update application status
router.patch(
    "/applications/:applicationId/status",
    protect,
    authorize("recruiter"),
    recruiterController.updateApplicationStatus
);
router.get(
    "/applications/:applicationId",
    protect,
    authorize("recruiter"),
    recruiterController.getApplicationById
);
router.get(
    "/candidates/:applicationId",
    protect,
    authorize("recruiter"),
    recruiterCandidateController.getCandidateDetails
);
module.exports = router;