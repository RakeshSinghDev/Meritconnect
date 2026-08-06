import { useEffect } from "react";

export const useInterviewTimer = (isActive: boolean, onTick: () => void) => {
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            onTick();
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTick]);
};

export const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
