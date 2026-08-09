const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const { getIO } = require("../socket");

/**
 * Create Notification
 */
const createNotification = async ({
    recipient,
    sender = null,
    title,
    message,
    type = "System",
    data = {},
}) => {
    const notification = await Notification.create({
        recipient,
        sender,
        title,
        message,
        type,
        data,
    });

    // Emit Socket.IO notification
    try {
        const io = getIO();

        io.to(recipient.toString()).emit(
            "notification",
            notification
        );
    } catch (err) {
        console.error(
            "Socket Notification Failed:",
            err.message
        );
    }

    return notification;
};

/**
 * Get User Notifications
 */
const getNotifications = async (
    userId,
    page = 1,
    limit = 10
) => {
    const notifications = await Notification.find({
        recipient: userId,
    })
        .populate("sender", "name email")
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Notification.countDocuments({
        recipient: userId,
    });

    return {
        notifications,
        pagination: {
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

/**
 * Get Unread Notification Count
 */
const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({
        recipient: userId,
        isRead: false,
    });
};

/**
 * Mark Single Notification as Read
 */
const markAsRead = async (
    notificationId,
    userId
) => {
    const notification =
        await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    if (
        notification.recipient.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "Not authorized"
        );
    }

    notification.isRead = true;

    await notification.save();

    return notification;
};

/**
 * Mark All Notifications as Read
 */
const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        {
            recipient: userId,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
            },
        }
    );
};

/**
 * Delete Notification
 */
const deleteNotification = async (
    notificationId,
    userId
) => {
    const notification =
        await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    if (
        notification.recipient.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "Not authorized"
        );
    }

    await notification.deleteOne();
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};