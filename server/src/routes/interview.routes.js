const express = require("express");

const router = express.Router();

const interviewController = require("../controllers/interview.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");

const {
    scheduleInterviewValidator,
} = require("../validators/interview.validator");
// ==========================================
// Recruiter
// ==========================================

// Schedule Interview
router.post(
    "/",
    protect,
    authorize("recruiter"),
    scheduleInterviewValidator,
    validate,
    interviewController.scheduleInterview
);

// Get Recruiter Interviews
router.get(
    "/recruiter",
    protect,
    authorize("recruiter"),
    interviewController.getRecruiterInterviews
);

// Cancel Interview
router.delete(
    "/:id",
    protect,
    authorize("recruiter"),
    interviewController.cancelInterview
);

// ==========================================
// Candidate
// ==========================================

// Get Candidate Interviews
router.get(
    "/candidate",
    protect,
    authorize("candidate"),
    interviewController.getCandidateInterviews
);

module.exports = router;