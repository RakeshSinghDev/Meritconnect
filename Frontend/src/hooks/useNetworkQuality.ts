import { useState, useEffect } from "react";

export const useNetworkQuality = () => {
    const [quality, setQuality] = useState<"excellent" | "good" | "poor">("excellent");
    const [rtt, setRtt] = useState<number>(45);

    useEffect(() => {
        const checkSpeed = async () => {
            const nav = navigator as any;
            if (nav.connection) {
                const effectiveType = nav.connection.effectiveType;
                if (effectiveType === "4g") setQuality("excellent");
                else if (effectiveType === "3g") setQuality("good");
                else setQuality("poor");
                setRtt(nav.connection.rtt || 50);
            }
        };

        checkSpeed();
        const interval = setInterval(checkSpeed, 5000);
        return () => clearInterval(interval);
    }, []);

    return { quality, rtt };
};
