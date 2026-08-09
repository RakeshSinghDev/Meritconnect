const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");

router.get("/test", aiController.testAI);

router.post(
    "/resume-analysis",
    aiController.resumeAnalysis
);

module.exports = router;