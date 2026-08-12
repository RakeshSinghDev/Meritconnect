import api from "../lib/api";

export interface GovernmentOpportunity {
    _id: string;
    source: string;
    sourceId: string;
    organization: string;
    title: string;
    postName?: string;
    description?: string;
    qualification?: string;
    degree?: string[];
    discipline?: string[];
    ageLimit?: string;
    vacancies?: number;
    category?: string;
    state?: string;
    location?: string;
    applicationStartDate?: string;
    applicationLastDate?: string;
    examDate?: string;
    fee?: string;
    status: "NEW" | "APPLICATION_OPEN" | "CLOSING_SOON" | "CLOSED" | "UPCOMING";
    notificationUrl?: string;
    applicationUrl?: string;
    publishedAt?: string;
    fetchedAt?: string;
    eligibilityLabel?: string;
    matchPercentage?: number;
    isMatch?: boolean;
    reasons?: string[];
    createdAt: string;
}

export const getGovernmentOpportunities = async (
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
    state?: string,
    qualification?: string
) => {
    let url = `/government-opportunities?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    if (state) url += `&state=${state}`;
    if (qualification) url += `&qualification=${qualification}`;

    const response = await api.get(url);
    return response.data;
};

export const getLatestGovernmentOpportunities = async () => {
    const response = await api.get(`/government-opportunities/latest`);
    return response.data;
};

export const getClosingSoonGovernmentOpportunities = async () => {
    const response = await api.get(`/government-opportunities/closing-soon`);
    return response.data;
};

export const getRecommendedGovernmentOpportunities = async () => {
    const response = await api.get(`/government-opportunities/recommended`);
    return response.data;
};

export const syncGovernmentOpportunities = async () => {
    const response = await api.post(`/government-opportunities/sync`);
    return response.data;
};

export const getGovernmentOpportunityById = async (id: string) => {
    const response = await api.get(`/government-opportunities/${id}`);
    return response.data;
};
