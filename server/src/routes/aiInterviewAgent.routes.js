const express = require("express");
const router = express.Router();
const aiInterviewAgentController = require("../controllers/aiInterviewAgent.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

// Recruiter creates session
router.post(
    "/",
    protect,
    authorize("recruiter"),
    aiInterviewAgentController.createSession
);

// Get candidate sessions
router.get(
    "/candidate",
    protect,
    authorize("candidate"),
    aiInterviewAgentController.getCandidateInterviews
);

// Get recruiter sessions
router.get(
    "/recruiter",
    protect,
    authorize("recruiter"),
    aiInterviewAgentController.getRecruiterInterviews
);

// Get single session details
router.get(
    "/:id",
    protect,
    aiInterviewAgentController.getSession
);

// Candidate starts interview
router.post(
    "/:id/start",
    protect,
    authorize("candidate"),
    aiInterviewAgentController.startInterview
);

// Candidate submits answer
router.post(
    "/:id/answer",
    protect,
    authorize("candidate"),
    aiInterviewAgentController.submitAnswer
);

// Candidate submits code
router.post(
    "/:id/code/submit",
    protect,
    authorize("candidate"),
    aiInterviewAgentController.submitCode
);

// Candidate sends live telemetry/metrics
router.post(
    "/:id/metrics",
    protect,
    authorize("candidate"),
    aiInterviewAgentController.updateMetrics
);

// Complete interview & generate executive report
router.post(
    "/:id/complete",
    protect,
    aiInterviewAgentController.completeInterview
);

// Get AI Interview report
router.get(
    "/:id/report",
    protect,
    aiInterviewAgentController.getReport
);

// Recruiter cancels interview session
router.delete(
    "/:id",
    protect,
    authorize("recruiter"),
    aiInterviewAgentController.cancelSession
);

// Recruiter updates / reschedules interview session configuration
router.patch(
    "/:id",
    protect,
    authorize("recruiter"),
    aiInterviewAgentController.updateSession
);

module.exports = router;
