import api from "../lib/api";

import type { NotificationResponse } from "../types/notification";

export const getNotifications =
    async (
        page = 1
    ): Promise<NotificationResponse> => {

        const { data } =
            await api.get(
                `/notifications?page=${page}`
            );

        return data.data;

    };

export const getUnreadCount =
    async (): Promise<number> => {

        const { data } =
            await api.get(
                "/notifications/unread-count"
            );

        return data.data.unreadCount;

    };

export const markAsRead =
    async (
        id: string
    ): Promise<void> => {

        await api.patch(
            `/notifications/${id}/read`
        );

    };

export const markAllAsRead =
    async (): Promise<void> => {

        await api.patch(
            "/notifications/read-all"
        );

    };

export const deleteNotification =
    async (
        id: string
    ): Promise<void> => {

        await api.delete(
            `/notifications/${id}`
        );

    };
