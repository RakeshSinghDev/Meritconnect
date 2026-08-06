import api from "../lib/api";

export const getRecruiterDashboard = async () => {
    const { data } = await api.get(
        "/recruiter/dashboard"
    );

    return data.data;
};

export const getJobApplications = async (
    jobId: string
) => {
    const { data } = await api.get(
        `/recruiter/jobs/${jobId}/applications`
    );

    return data.data;
};

export const getApplicationById = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/recruiter/applications/${applicationId}`
    );

    return data.data;
};

export const updateApplicationStatus = async (
    applicationId: string,
    status: string
) => {
    const { data } = await api.patch(
        `/recruiter/applications/${applicationId}/status`,
        {
            status,
        }
    );

    return data.data;
};

export const getCandidateDetails = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/recruiter/candidates/${applicationId}`
    );

    return data.data;
};