const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const userController = require("../controllers/user.controller");

// Get Current User
router.get(
    "/me",
    protect,
    userController.getCurrentUser
);

// Update Profile
router.patch(
    "/me",
    protect,
    userController.updateCurrentUser
);

module.exports = router;