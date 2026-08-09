const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

// Get all notifications
router.get(
    "/",
    protect,
    notificationController.getNotifications
);

// Get unread count
router.get(
    "/unread-count",
    protect,
    notificationController.getUnreadCount
);

// Mark one notification as read
router.patch(
    "/:id/read",
    protect,
    notificationController.markAsRead
);

// Mark all notifications as read
router.patch(
    "/read-all",
    protect,
    notificationController.markAllAsRead
);

// Delete notification
router.delete(
    "/:id",
    protect,
    notificationController.deleteNotification
);

module.exports = router;