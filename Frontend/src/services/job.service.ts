import api from "../lib/api";
import type { CreateJobDto, Job, UpdateJobDto } from "../types/job";

export const getJobs = async (): Promise<Job[]> => {
    const { data } = await api.get("/jobs");

    // Backend returns:
    // { success, message, data: { jobs, pagination } }

    return data.data.jobs;
};

export const getMyJobs = async (): Promise<Job[]> => {
    const { data } = await api.get("/jobs/my-jobs");

    return data.data;
};

export const getJobById = async (
    id: string
): Promise<Job> => {
    const { data } = await api.get(`/jobs/${id}`);

    return data.data;
};

export const createJob = async (
    payload: CreateJobDto
): Promise<Job> => {
    const { data } = await api.post("/jobs", payload);

    return data.data;
};

export const updateJob = async (
    id: string,
    payload: UpdateJobDto
): Promise<Job> => {
    const { data } = await api.put(
        `/jobs/${id}`,
        payload
    );

    return data.data;
};

export const deleteJob = async (
    id: string
): Promise<void> => {
    await api.delete(`/jobs/${id}`);
};
