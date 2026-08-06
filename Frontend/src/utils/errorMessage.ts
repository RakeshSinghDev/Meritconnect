import { isAxiosError } from "axios";

export const errorMessage = (error: unknown, fallback: string): string =>
    isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? fallback
        : fallback;
