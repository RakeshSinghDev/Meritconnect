const express = require("express");

const router = express.Router();

const candidateController = require("../controllers/candidate.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

// ==========================================
// Candidate Dashboard
// ==========================================

router.get(
    "/dashboard",
    protect,
    authorize("candidate"),
    candidateController.getDashboard
);

// ==========================================
// Candidate Profile
// ==========================================

router.get(
    "/profile",
    protect,
    authorize("candidate"),
    candidateController.getProfile
);

router.patch(
    "/profile",
    protect,
    authorize("candidate"),
    candidateController.updateProfile
);

// ==========================================
// Applications
// ==========================================

router.get(
    "/applications",
    protect,
    authorize("candidate"),
    candidateController.getMyApplications
);

router.get(
    "/applications/:applicationId",
    protect,
    authorize("candidate"),
    candidateController.getApplicationById
);

router.delete(
    "/applications/:applicationId",
    protect,
    authorize("candidate"),
    candidateController.withdrawApplication
);

// ==========================================
// Saved Jobs
// ==========================================

router.post(
    "/saved-jobs/:jobId",
    protect,
    authorize("candidate"),
    candidateController.saveJob
);

router.get(
    "/saved-jobs",
    protect,
    authorize("candidate"),
    candidateController.getSavedJobs
);

router.delete(
    "/saved-jobs/:jobId",
    protect,
    authorize("candidate"),
    candidateController.removeSavedJob
);

module.exports = router;