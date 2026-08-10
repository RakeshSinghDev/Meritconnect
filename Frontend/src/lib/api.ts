import axios from "axios";

const getBaseURL = () => {
    const rawUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000";
    const cleanUrl = rawUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api/v1") ? cleanUrl : `${cleanUrl}/api/v1`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Authorization Bearer token header if present in localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config as
            | (typeof error.config & { _retry?: boolean })
            | undefined;

        const isAuthEndpoint =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh-token");

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            originalRequest._retry = true;
            try {
                refreshPromise ??= (async () => {
                    const storedRefreshToken = localStorage.getItem("refreshToken");
                    const res = await api.post("/auth/refresh-token", {
                        refreshToken: storedRefreshToken,
                    });

                    const newToken =
                        res.data?.data?.accessToken ||
                        res.data?.accessToken ||
                        "";

                    if (newToken) {
                        localStorage.setItem("accessToken", newToken);
                        return newToken;
                    }
                    return null;
                })();

                const newToken = await refreshPromise;

                if (newToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("isLoggedIn");
                return Promise.reject(refreshErr);
            } finally {
                refreshPromise = null;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
