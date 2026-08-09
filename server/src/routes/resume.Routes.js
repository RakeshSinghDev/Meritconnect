const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload.middleware");
const resumeController = require("../controllers/resume.controller");

router.post(
    "/upload",
    protect,
    authorize("candidate"),
    upload.single("resume"),
    resumeController.uploadResume
);

// NEW
router.get(
    "/",
    protect,
    authorize("candidate"),
    resumeController.getResume
);
router.delete(
    "/",
    protect,
    authorize("candidate"),
    resumeController.deleteResume
);

module.exports = router;