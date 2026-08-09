const express = require("express");

const router = express.Router();

const aiInterviewController = require("../controllers/aiInterview.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

router.post(
    "/:id/interview-questions",
    protect,
    authorize("recruiter"),
    aiInterviewController.generateInterviewQuestions
);
router.post(

    "/application/:applicationId/session",

    protect,

    authorize("recruiter"),

    aiInterviewController.createInterviewSession

);
// Candidate starts interview
router.post(
    "/session/:sessionId/start",
    protect,
    authorize("candidate"),
    aiInterviewController.startInterview
);

// Candidate submits answer
router.post(
    "/session/:sessionId/answer",
    protect,
    authorize("candidate"),
    aiInterviewController.submitAnswer
);

// Candidate ends interview
router.post(
    "/session/:sessionId/end",
    protect,
    authorize("candidate"),
    aiInterviewController.endInterview
);

// Recruiter views report
router.get(
    "/session/:sessionId/report",
    protect,
    authorize("recruiter"),
    aiInterviewController.getInterviewReport
);

module.exports = router;