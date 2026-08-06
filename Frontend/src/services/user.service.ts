import api from "../lib/api";

export interface UpdateProfilePayload {
    name: string;
    bio: string;
    phone: string;
    location: string;
    education: string;
    college: string;
    experience: number;
    currentCompany: string;
    currentPosition: string;
    github: string;
    linkedin: string;
    portfolio: string;
    skills: string;
}

export const getCurrentUser = async () => {
    const { data } = await api.get("/users/me");
    return data.data;
};

export const updateCurrentUser = async (
    payload: UpdateProfilePayload
) => {
    const { data } = await api.patch(
        "/users/me",
        payload
    );

    return data.data;
};