const express = require("express");

const router = express.Router();

const controller = require("../controllers/liveInterview.controller");

router.post("/:id/start", controller.startInterview);

router.post("/:id/answer", controller.submitAnswer);

router.post("/:id/complete", controller.completeInterview);

module.exports = router;