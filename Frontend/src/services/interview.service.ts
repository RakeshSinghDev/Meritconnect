import api from "../lib/api";
import type {
    Interview,
    ScheduleInterviewDto,
} from "../types/interview";

/**
 * Get all recruiter interviews
 */
export const getRecruiterInterviews =
    async (): Promise<Interview[]> => {

        const { data } =
            await api.get(
                "/interviews/recruiter"
            );

        return data.data;

    };

/**
 * Get candidate interviews
 */
export const getCandidateInterviews =
    async (): Promise<Interview[]> => {

        const { data } =
            await api.get(
                "/interviews/candidate"
            );

        return data.data;

    };

/**
 * Schedule Interview
 */
export const scheduleInterview =
    async (
        payload: ScheduleInterviewDto
    ): Promise<Interview> => {

        const { data } =
            await api.post(
                "/interviews",
                payload
            );

        return data.data;

    };

/**
 * Cancel Interview
 */
export const cancelInterview =
    async (
        interviewId: string
    ): Promise<void> => {

        await api.delete(
            `/interviews/${interviewId}`
        );

    };