const express = require("express");
const router = express.Router();

const governmentOpportunityController = require("../controllers/governmentOpportunity.controller");
const protect = require("../middleware/auth.middleware");

// =======================
// Public Routes
// =======================

// Get latest government opportunities
router.get("/latest", governmentOpportunityController.getLatest);

// Get closing soon government opportunities
router.get("/closing-soon", governmentOpportunityController.getClosingSoon);

// Get all government opportunities
router.get("/", governmentOpportunityController.getAllOpportunities);

// Get recommended government opportunities (Requires login)
router.get("/recommended", protect, governmentOpportunityController.getRecommended);

// Trigger aggregation sync manually
router.post("/sync", protect, governmentOpportunityController.syncGovernmentJobs);

// Get single government opportunity
router.get("/:id", governmentOpportunityController.getOpportunityById);

// Create government opportunity (Admin/Testing)
router.post("/", protect, governmentOpportunityController.createOpportunity);

module.exports = router;
