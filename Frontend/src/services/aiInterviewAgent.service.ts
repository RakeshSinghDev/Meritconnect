import api from "../lib/api";
import type {
    AIInterviewSession,
    CreateAIInterviewDto,
    AIInterviewReport,
    AIQuestion,
    CodingChallenge,
} from "../types/aiInterview";

/**
 * Create a new AI Interview session (Recruiter)
 */
export const createAIInterviewSession = async (
    payload: CreateAIInterviewDto
): Promise<AIInterviewSession> => {
    const { data } = await api.post("/ai-interviews", payload);
    return data.data;
};

/**
 * Get AI Interview by ID
 */
export const getAIInterviewById = async (
    id: string
): Promise<AIInterviewSession> => {
    const { data } = await api.get(`/ai-interviews/${id}`);
    return data.data;
};

/**
 * Get candidate's list of AI Interviews
 */
export const getCandidateAIInterviews = async (): Promise<AIInterviewSession[]> => {
    const { data } = await api.get("/ai-interviews/candidate");
    return data.data;
};

/**
 * Get recruiter's list of AI Interviews
 */
export const getRecruiterAIInterviews = async (): Promise<AIInterviewSession[]> => {
    const { data } = await api.get("/ai-interviews/recruiter");
    return data.data;
};

/**
 * Start interview session & trigger AI greeting
 */
export const startAIInterview = async (
    id: string
): Promise<{
    session: AIInterviewSession;
    agentData: {
        greeting: string;
        firstQuestion: AIQuestion;
        transcript: any[];
    };
}> => {
    const { data } = await api.post(`/ai-interviews/${id}/start`);
    return data.data;
};

/**
 * Submit candidate answer & receive adaptive response / next question
 */
export const submitAnswer = async (
    id: string,
    questionIndex: number,
    answer: string
): Promise<{
    interviewStatus: "InProgress" | "Completed";
    interviewerSpeech: string;
    nextStep: "nextQuestion" | "followUp" | "coding" | "wrapup";
    nextQuestion?: AIQuestion;
    codingChallenge?: CodingChallenge;
    evaluation?: any;
}> => {
    const { data } = await api.post(`/ai-interviews/${id}/answer`, {
        questionIndex,
        answer,
    });
    return data.data;
};

/**
 * Submit candidate code solution
 */
export const submitCode = async (
    id: string,
    challengeIndex: number,
    code: string,
    language: string
): Promise<{
    evaluation: any;
    interviewerSpeech: string;
}> => {
    const { data } = await api.post(`/ai-interviews/${id}/code/submit`, {
        challengeIndex,
        code,
        language,
    });
    return data.data;
};

/**
 * Update candidate live metrics (telemetry)
 */
export const updateMetrics = async (
    id: string,
    metrics: {
        confidence?: number;
        speakingSpeed?: number;
        eyeContactScore?: number;
        fillerWords?: string;
    }
): Promise<any> => {
    const { data } = await api.post(`/ai-interviews/${id}/metrics`, metrics);
    return data.data;
};

/**
 * Complete AI Interview and generate evaluation report
 */
export const completeAIInterview = async (
    id: string
): Promise<AIInterviewReport> => {
    const { data } = await api.post(`/ai-interviews/${id}/complete`);
    return data.data;
};

/**
 * Cancel AI Interview session (Recruiter)
 */
export const cancelAIInterviewSession = async (
    id: string
): Promise<AIInterviewSession> => {
    const { data } = await api.delete(`/ai-interviews/${id}`);
    return data.data;
};

/**
 * Update / Reschedule AI Interview session configuration (Recruiter)
 */
export const updateAIInterviewSession = async (
    id: string,
    payload: {
        type?: string;
        config?: Partial<AIInterviewSession["config"]>;
    }
): Promise<AIInterviewSession> => {
    const { data } = await api.patch(`/ai-interviews/${id}`, payload);
    return data.data;
};

