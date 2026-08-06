import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config as
            | (typeof error.config & { _retry?: boolean })
            | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh-token")
        ) {
            originalRequest._retry = true;
            try {
                refreshPromise ??= api.post("/auth/refresh-token").then(() => undefined);
                await refreshPromise;
                return api(originalRequest);
            } catch {
                window.location.href = "/login";
            } finally {
                refreshPromise = null;
            }
        } else if (error.response?.status === 401) {
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
