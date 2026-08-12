import api from "../lib/api";

export const getPreferences = () => api.get("/job-finder/preferences");
export const updatePreferences = (data: any) => api.put("/job-finder/preferences", data);
export const runSearch = () => api.post("/job-finder/search");
export const getRecommendations = (page = 1, limit = 20) =>
    api.get(`/job-finder/recommendations?page=${page}&limit=${limit}`);
export const getRecommendationById = (id: string) =>
    api.get(`/job-finder/recommendations/${id}`);
export const generateApplicationKit = (id: string) =>
    api.post(`/job-finder/recommendations/${id}/application-kit`);
export const updateRecommendationStatus = (id: string, status: string) =>
    api.patch(`/job-finder/recommendations/${id}/status`, { status });
export const getSearchHistory = () => api.get("/job-finder/history");
