export interface Notification {
    _id: string;

    title: string;

    message: string;

    type:
    | "Interview"
    | "Application"
    | "System";

    isRead: boolean;

    sender?: {
        _id: string;
        name: string;
        email: string;
    };

    createdAt: string;

    updatedAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];

    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
    };
}