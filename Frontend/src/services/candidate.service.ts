import api from "../lib/api";

// ===============================
// Dashboard
// ===============================

export const getCandidateDashboard = async () => {
    const { data } = await api.get("/candidate/dashboard");
    return data.data;
};

// ===============================
// Profile
// ===============================

export const getProfile = async () => {
    const { data } = await api.get("/candidate/profile");
    return data.data;
};

export const updateProfile = async (profile: {
    name: string;
    bio: string;
    phone: string;
    location: string;
    college: string;
    education: string;
    experience: number;
    currentCompany: string;
    currentPosition: string;
    github: string;
    linkedin: string;
    portfolio: string;
    skills: string | string[];
}) => {
    const { data } = await api.patch(
        "/candidate/profile",
        profile
    );

    return data.data;
};

// ===============================
// Applications
// ===============================

export const getCandidateApplications = async () => {
    const { data } = await api.get(
        "/candidate/applications"
    );

    return data.data;
};

// ===============================
// Saved Jobs
// ===============================

export const getSavedJobs = async () => {
    const { data } = await api.get(
        "/candidate/saved-jobs"
    );

    return data.data;
};

export const saveJob = async (
    jobId: string
) => {
    const { data } = await api.post(
        `/candidate/saved-jobs/${jobId}`
    );

    return data.data;
};

export const removeSavedJob = async (
    jobId: string
) => {
    const { data } = await api.delete(
        `/candidate/saved-jobs/${jobId}`
    );

    return data.data;
};