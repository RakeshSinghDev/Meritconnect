const notificationService = require("../services/notification.service");

const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Get Notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await notificationService.getNotifications(
        req.user._id,
        page,
        limit
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notifications fetched successfully",
            data
        )
    );
});

/**
 * Get Unread Count
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Unread notification count fetched successfully",
            {
                unreadCount: count,
            }
        )
    );
});

/**
 * Mark Notification as Read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
    const notification =
        await notificationService.markAsRead(
            req.params.id,
            req.user._id
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notification marked as read",
            notification
        )
    );
});

/**
 * Mark All Notifications as Read
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "All notifications marked as read"
        )
    );
});

/**
 * Delete Notification
 */
exports.deleteNotification = asyncHandler(
    async (req, res) => {
        await notificationService.deleteNotification(
            req.params.id,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Notification deleted successfully"
            )
        );
    }
);