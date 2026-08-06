import api from "../lib/api";

import type { Application } from "../types/application";

export interface Activity {
    _id: string;
    action: string;
    createdAt: string;
}

export interface ApplicationResumeResponse {
    applicationId: string;
    candidateName: string;
    email: string;
    jobTitle: string;
    status: string;
    atsScore: number;
    resumeUrl: string;
    fileName: string;
    uploadedAt: string;
    candidate?: any;
    job?: any;
    aiAnalysis?: any;
}

export const applyJob = async (
    jobId: string,
    payload: FormData
): Promise<Application> => {
    const { data } = await api.post(
        `/applications/${jobId}`,
        payload,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        }
    );

    return data.data;
};

export const getMyApplications = async (): Promise<
    Application[]
> => {
    const { data } = await api.get(
        "/applications/my-applications"
    );

    return data.data;
};

export const getJobApplications = async (
    jobId: string
): Promise<Application[]> => {
    const { data } = await api.get(
        `/applications/job/${jobId}`
    );

    return data.data;
};

export const getApplicationById = async (
    id: string
): Promise<Application> => {
    const { data } = await api.get(
        `/applications/${id}`
    );

    return data.data;
};

export const updateApplicationStatus = async (
    applicationId: string,
    status: string
): Promise<Application> => {
    const { data } = await api.patch(
        `/applications/${applicationId}/status`,
        { status }
    );

    return data.data;
};

export const getApplicationActivity = async (
    id: string
): Promise<Activity[]> => {
    const { data } = await api.get(
        `/applications/${id}/activity`
    );

    return data.data;
};

export const getApplicationResume = async (
    applicationId: string
): Promise<ApplicationResumeResponse> => {
    const { data } = await api.get(
        `/applications/${applicationId}/resume`
    );

    return data.data;
};
