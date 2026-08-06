import { useState, useEffect, useRef } from "react";

export const useSpeechSynthesis = (
    onBoundary?: (charIndex: number) => void,
    onEnd?: () => void
) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if ("speechSynthesis" in window) {
            synthRef.current = window.speechSynthesis;
            const updateVoices = () => {
                if (synthRef.current) {
                    setAvailableVoices(synthRef.current.getVoices());
                }
            };
            updateVoices();
            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = updateVoices;
            }
        }
    }, []);

    const speak = (text: string) => {
        if (!synthRef.current) return;

        synthRef.current.cancel(); // Stop any active speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Natural interview pace
        utterance.pitch = 1.0;

        // Pick natural voice if available
        const voices = availableVoices.length > 0 ? availableVoices : (synthRef.current.getVoices() || []);
        const preferredVoice = voices.find(
            (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Karen"))
        ) || voices.find((v) => v.lang.startsWith("en"));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        utterance.onboundary = (event) => {
            if (onBoundary) {
                onBoundary(event.charIndex);
            }
        };

        synthRef.current.speak(utterance);
    };

    const stop = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    return { isSpeaking, speak, stop };
};
