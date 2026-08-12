import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionOptions {
    onFinalTranscript?: (text: string) => void;
    onSpeechEnd?: (text: string) => void;
    silenceTimeoutMs?: number;
}

export const useSpeechRecognition = (options?: SpeechRecognitionOptions | ((text: string) => void)) => {
    const onFinalTranscript = typeof options === "function" ? options : options?.onFinalTranscript;
    const onSpeechEnd = typeof options === "object" ? options?.onSpeechEnd : undefined;
    const silenceTimeoutMs = (typeof options === "object" && options?.silenceTimeoutMs) || 1500;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accumulatedTextRef = useRef<string>("");
    const shouldBeListeningRef = useRef<boolean>(false);

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    const handleSpeechEnd = useCallback(() => {
        clearSilenceTimer();
        const finalText = accumulatedTextRef.current.trim();
        if (finalText) {
            console.log("[Interview] Silence detected — triggering speech end with text:", finalText);
            if (onSpeechEnd) {
                onSpeechEnd(finalText);
            }
        }
    }, [onSpeechEnd]);

    const resetSilenceTimer = useCallback(() => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
            handleSpeechEnd();
        }, silenceTimeoutMs);
    }, [silenceTimeoutMs, handleSpeechEnd]);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("[Interview] Web Speech API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            console.log("[Interview] Listening started");
            setIsListening(true);
        };

        recognition.onend = () => {
            console.log("[Interview] Recognition onend fired");
            setIsListening(false);
            // Auto-restart if browser stopped recognition prematurely while we are still supposed to be listening
            if (shouldBeListeningRef.current) {
                try {
                    recognition.start();
                } catch (err) {
                    // Ignore restart errors if already started
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.warn("[Interview] Speech recognition error:", event.error);
            if (event.error === "no-speech" || event.error === "audio-capture") {
                // Non-fatal, keep listening state intact
            }
        };

        recognition.onresult = (event: any) => {
            let currentInterim = "";
            let newFinalChunk = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newFinalChunk += event.results[i][0].transcript + " ";
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            if (newFinalChunk) {
                accumulatedTextRef.current = (accumulatedTextRef.current + " " + newFinalChunk).replace(/\s+/g, " ").trim();
                setTranscript(accumulatedTextRef.current);
                console.log("[Interview] Final transcript chunk received:", newFinalChunk.trim());
                if (onFinalTranscript) {
                    onFinalTranscript(accumulatedTextRef.current);
                }
                resetSilenceTimer();
            }

            if (currentInterim) {
                setInterimTranscript(currentInterim);
                resetSilenceTimer();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            clearSilenceTimer();
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (_) {}
            }
        };
    }, [onFinalTranscript, resetSilenceTimer, silenceTimeoutMs]);

    const startListening = () => {
        shouldBeListeningRef.current = true;
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                // Ignore if already running
            }
        }
    };

    const stopListening = () => {
        shouldBeListeningRef.current = false;
        clearSilenceTimer();
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {}
        }
        setIsListening(false);
    };

    const resetTranscript = () => {
        clearSilenceTimer();
        accumulatedTextRef.current = "";
        setTranscript("");
        setInterimTranscript("");
    };

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
    };
};

