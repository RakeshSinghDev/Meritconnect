import { useCallback, useEffect, useState } from "react";
import {
    CheckCheck,
    Trash2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Notification } from "../../types/notification";

import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../services/notification.service";

interface Props {
    onClose: () => void;
    onUnreadChange?: (count: number) => void;
}

const NotificationDropdown = ({
    onClose,
    onUnreadChange,
}: Props) => {
    const [notifications, setNotifications] = useState<
        Notification[]
    >([]);

    const [loading, setLoading] = useState(true);

    const updateUnreadCount = useCallback((
        list: Notification[]
    ) => {
        const unreadCount = list.filter(
            (item) => !item.isRead
        ).length;

        onUnreadChange?.(unreadCount);
    }, [onUnreadChange]);

    const loadNotifications = useCallback(async () => {
        try {
            const data =
                await getNotifications();

            setNotifications(
                data.notifications
            );

            updateUnreadCount(
                data.notifications
            );
        } catch {
            toast.error(
                "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    }, [updateUnreadCount]);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    const handleRead = async (
        id: string
    ) => {
        try {
            await markAsRead(id);

            const updated =
                notifications.map((item) =>
                    item._id === id
                        ? {
                            ...item,
                            isRead: true,
                        }
                        : item
                );

            setNotifications(updated);

            updateUnreadCount(updated);
        } catch {
            toast.error(
                "Failed to mark notification."
            );
        }
    };

    const handleReadAll =
        async () => {
            try {
                await markAllAsRead();

                const updated =
                    notifications.map(
                        (item) => ({
                            ...item,
                            isRead: true,
                        })
                    );

                setNotifications(updated);

                updateUnreadCount(
                    updated
                );
            } catch {
                toast.error(
                    "Failed to mark all notifications."
                );
            }
        };

    const handleDelete = async (
        id: string
    ) => {
        try {
            await deleteNotification(id);

            const updated =
                notifications.filter(
                    (item) =>
                        item._id !== id
                );

            setNotifications(updated);

            updateUnreadCount(updated);
        } catch {
            toast.error(
                "Failed to delete notification."
            );
        }
    };

    if (loading) {
        return (
            <div className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">

                <div className="space-y-5">

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse"
                        >
                            <div className="mb-2 h-4 w-36 rounded bg-gray-200"></div>

                            <div className="h-3 w-full rounded bg-gray-100"></div>
                        </div>
                    ))}

                </div>

            </div>
        );
    }

    return (
        <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <h2 className="text-lg font-semibold">
                    Notifications
                </h2>

                <div className="flex items-center gap-2">

                    <button
                        onClick={
                            handleReadAll
                        }
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition hover:bg-gray-100"
                    >
                        <CheckCheck
                            size={16}
                        />

                        Mark all
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 transition hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>

                </div>

            </div>

            {/* Body */}

            <div className="max-h-[450px] overflow-y-auto">

                {notifications.length ===
                    0 ? (
                    <div className="py-12 text-center text-gray-500">

                        No notifications

                    </div>
                ) : (
                    notifications.map(
                        (item) => (
                            <div
                                key={
                                    item._id
                                }
                                className={`border-b border-gray-100 p-4 transition hover:bg-gray-50 ${!item.isRead
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                            >

                                <div className="flex justify-between">

                                    <div className="flex-1">

                                        <h3 className="font-semibold">
                                            {
                                                item.title
                                            }
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {
                                                item.message
                                            }
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                item._id
                                            )
                                        }
                                        className="ml-3 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2
                                            size={
                                                16
                                            }
                                        />
                                    </button>

                                </div>

                                {!item.isRead && (
                                    <button
                                        onClick={() =>
                                            handleRead(
                                                item._id
                                            )
                                        }
                                        className="mt-4 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        Mark as Read
                                    </button>
                                )}

                            </div>
                        )
                    )
                )}

            </div>

        </div>
    );
};

export default NotificationDropdown;
