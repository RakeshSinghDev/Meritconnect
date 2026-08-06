import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    Trash2,
    CheckCheck,
} from "lucide-react";

import {
    deleteNotification,
    getNotifications,
    markAllAsRead,
    markAsRead,
} from "../../services/notification.service";

import type { Notification } from "../../types/notification";

const NotificationList = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleRead = async (id: string) => {
        try {
            await markAsRead(id);
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReadAll = async () => {
        try {
            await markAllAsRead();
            loadNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl">
                Loading notifications...
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <Bell className="h-3.5 w-3.5 text-neutral-400" />
                        <span>System Notifications</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Notifications
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Activity alerts, candidate submissions, and interview updates.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={handleReadAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                        <CheckCheck size={15} />
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#ECECEC] bg-white p-12 text-center space-y-2">
                    <Bell size={28} className="mx-auto text-neutral-300" />
                    <h2 className="text-xs font-semibold text-neutral-700">No Notifications</h2>
                    <p className="text-[11px] text-neutral-400">
                        You're all caught up with your recruitment stream.
                    </p>
                </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`rounded-2xl border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition ${
                            notification.isRead
                                ? "bg-white border-[#ECECEC]"
                                : "bg-blue-50/40 border-blue-200/60"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-xs text-neutral-900">
                                        {notification.title}
                                    </h3>
                                    {!notification.isRead && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    )}
                                </div>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-[10px] font-mono text-neutral-400 pt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleRead(notification._id)}
                                        className="p-1.5 rounded-lg border border-[#ECECEC] text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                        title="Mark as Read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(notification._id)}
                                    className="p-1.5 rounded-lg border border-[#ECECEC] text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationList;