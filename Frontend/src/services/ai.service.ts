import api from "../lib/api";

/**
 * Analyze candidate resume against a job.
 */
export const analyzeResume = async (applicationId: string) => {
    const { data } = await api.post(
        "/ai/resume-analysis",
        {
            applicationId,
        }
    );

    return data.data;
};

/**
 * Resume match percentage
 */
export const getResumeMatch = async (applicationId: string) => {
    const { data } = await api.get(
        `/ai/resume-match/${applicationId}`
    );

    return data.data;
};

/**
 * Generate AI Summary
 */
export const getCandidateSummary = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/ai/candidate-summary/${applicationId}`
    );

    return data.data;
};

/**
 * ATS Score
 */
export const getATSScore = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/ai/ats-score/${applicationId}`
    );

    return data.data;
};

/**
 * Skill Match
 */
export const getSkillMatch = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/ai/skill-match/${applicationId}`
    );

    return data.data;
};

/**
 * Missing Skills
 */
export const getMissingSkills = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/ai/missing-skills/${applicationId}`
    );

    return data.data;
};

/**
 * Generate AI Interview
 */
export const generateInterview = async (
    applicationId: string
) => {
    const { data } = await api.post(
        `/ai/interview/${applicationId}`
    );

    return data.data;
};

/**
 * AI Candidate Recommendation
 */
export const getRecommendation = async (
    applicationId: string
) => {
    const { data } = await api.get(
        `/ai/recommendation/${applicationId}`
    );

    return data.data;
};

/**
 * Recruiter Shortlist
 */
export const shortlistCandidate = async (
    applicationId: string
) => {
    const { data } = await api.patch(
        `/applications/${applicationId}/status`,
        {
            status: "Shortlisted",
        }
    );

    return data.data;
};

/**
 * Recruiter Reject
 */
export const rejectCandidate = async (
    applicationId: string
) => {
    const { data } = await api.patch(
        `/applications/${applicationId}/status`,
        {
            status: "Rejected",
        }
    );

    return data.data;
};
