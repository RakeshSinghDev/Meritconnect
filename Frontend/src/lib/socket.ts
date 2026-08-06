import { io } from "socket.io-client";

const getSocketBaseUrl = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
    try {
        const url = new URL(apiBase);
        return url.origin; // e.g. "http://localhost:5000"
    } catch {
        return "http://localhost:5000";
    }
};

export const socketBaseUrl = getSocketBaseUrl();

export const socket = io(socketBaseUrl, {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const getAIInterviewSocket = () => {
    return io(`${socketBaseUrl}/ai-interview`, {
        withCredentials: true,
        autoConnect: false,
        transports: ["websocket", "polling"],
    });
};