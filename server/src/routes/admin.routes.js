const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize");

// Dashboard
router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    adminController.getDashboard
);
// Users
router.get(
    "/users",
    protect,
    authorize("admin"),
    adminController.getUsers
);

router.get(
    "/users/:id",
    protect,
    authorize("admin"),
    adminController.getUserById
);

router.patch(
    "/users/:id/status",
    protect,
    authorize("admin"),
    adminController.updateUserStatus
);

router.delete(
    "/users/:id",
    protect,
    authorize("admin"),
    adminController.deleteUser
);

module.exports = router;