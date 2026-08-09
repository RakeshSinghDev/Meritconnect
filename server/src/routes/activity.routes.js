const express = require("express");

const router = express.Router();

const activityController = require("../controllers/activity.controller");

const protect = require("../middleware/auth.middleware");

// Get Activity Timeline
router.get(
    "/:id/activity",
    protect,
    activityController.getApplicationActivities
);

module.exports = router;