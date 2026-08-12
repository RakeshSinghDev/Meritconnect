const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/jobFinder.controller");

router.use(protect);

// Rate limit search to 5 per hour
const searchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many searches. Please try again later." },
});

router.get("/preferences", controller.getPreferences);
router.put("/preferences", controller.updatePreferences);
router.post("/search", searchLimiter, controller.runSearch);
router.get("/recommendations", controller.getRecommendations);
router.get("/recommendations/:id", controller.getRecommendationById);
router.post("/recommendations/:id/application-kit", controller.generateApplicationKit);
router.patch("/recommendations/:id/status", controller.updateRecommendationStatus);
router.get("/history", controller.getSearchHistory);
router.delete("/reset", controller.resetSeenJobs);

module.exports = router;
