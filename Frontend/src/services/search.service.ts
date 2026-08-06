import api from "../lib/api";
import type { SearchJob } from "../types/search";

export const searchJobs = async (
    keyword: string
): Promise<SearchJob[]> => {

    if (!keyword.trim()) {
        return [];
    }

    const { data } = await api.get(
        `/jobs?keyword=${encodeURIComponent(
            keyword
        )}&limit=6`
    );

    return data.data.jobs;
};