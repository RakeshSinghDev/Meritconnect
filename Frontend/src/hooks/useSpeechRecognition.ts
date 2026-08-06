import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = (onFinalTranscript: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Web Speech API recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            let currentInterim = "";
            let currentFinal = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    currentFinal += event.results[i][0].transcript + " ";
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            if (currentFinal) {
                setTranscript((prev) => prev + currentFinal);
                onFinalTranscript(currentFinal.trim());
            }
            setInterimTranscript(currentInterim);
        };

        recognitionRef.current = recognition;
    }, [onFinalTranscript]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
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
