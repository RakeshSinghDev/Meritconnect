const express = require("express");
const router = express.Router();

const jobController = require("../controllers/job.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");

const {
    createJobValidator,
    updateJobValidator,
} = require("../validators/job.validator");

// =======================
// Public Routes
// =======================

// Get all jobs
router.get("/", jobController.getAllJobs);

// Get recruiter's jobs
router.get(
    "/my-jobs",
    protect,
    authorize("recruiter"),
    jobController.getRecruiterJobs
);

// Get single job
router.get("/:id", jobController.getJobById);

// =======================
// Recruiter Routes
// =======================

// Create job
router.post(
    "/",
    protect,
    authorize("recruiter"),
    createJobValidator,
    validate,
    jobController.createJob
);

// Update job
router.put(
    "/:id",
    protect,
    authorize("recruiter"),
    updateJobValidator,
    validate,
    jobController.updateJob
);

// Delete job
router.delete(
    "/:id",
    protect,
    authorize("recruiter"),
    jobController.deleteJob
);

module.exports = router;