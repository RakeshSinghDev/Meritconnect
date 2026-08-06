import { create } from "zustand";
import type {
    AIInterviewSession,
    AIQuestion,
    CodingChallenge,
    AIInterviewReport,
    TranscriptEntry,
} from "../types/aiInterview";
import {
    getAIInterviewById,
    startAIInterview,
    submitAnswer,
    submitCode,
    updateMetrics,
    completeAIInterview,
} from "../services/aiInterviewAgent.service";

export type InterviewerAvatarState = "idle" | "speaking" | "thinking" | "listening" | "encouraging";

interface AIInterviewState {
    // Session state
    session: AIInterviewSession | null;
    status: "idle" | "loading" | "waiting" | "active" | "coding" | "completed" | "error";
    error: string | null;

    // Timeline & Questions
    currentQuestionIndex: number;
    questions: AIQuestion[];
    currentCodingChallenge: CodingChallenge | null;
    transcript: TranscriptEntry[];

    // Avatar state
    avatarState: InterviewerAvatarState;
    currentSpeechText: string;
    isInterviewerSpeaking: boolean;

    // Media & Telemetry
    isMicOn: boolean;
    isCameraOn: boolean;
    networkQuality: "excellent" | "good" | "poor";
    elapsedSeconds: number;
    confidenceScore: number;
    eyeContactScore: number;

    // Final Report
    report: AIInterviewReport | null;

    // Actions
    fetchSession: (id: string) => Promise<void>;
    startSession: (id: string) => Promise<void>;
    sendAnswer: (answerText: string) => Promise<void>;
    sendCode: (code: string, language: string) => Promise<void>;
    updateLiveMetrics: (confidence: number, eyeContact: number, speed?: number) => void;
    finishInterview: () => Promise<void>;
    toggleMic: () => void;
    toggleCamera: () => void;
    setAvatarState: (state: InterviewerAvatarState) => void;
    setSpeechText: (text: string) => void;
    tickTimer: () => void;
}

export const useAIInterviewStore = create<AIInterviewState>((set, get) => ({
    session: null,
    status: "idle",
    error: null,

    currentQuestionIndex: 0,
    questions: [],
    currentCodingChallenge: null,
    transcript: [],

    avatarState: "idle",
    currentSpeechText: "",
    isInterviewerSpeaking: false,

    isMicOn: true,
    isCameraOn: true,
    networkQuality: "excellent",
    elapsedSeconds: 0,
    confidenceScore: 88,
    eyeContactScore: 92,

    report: null,

    fetchSession: async (id: string) => {
        set({ status: "loading", error: null });
        try {
            const data = await getAIInterviewById(id);
            set({
                session: data,
                status: data.status === "Completed" ? "completed" : "waiting",
                questions: data.questions || [],
                codingChallenges: data.codingChallenges || [],
                transcript: data.transcript || [],
                report: data.report || null,
            } as any);
        } catch (err: any) {
            set({ status: "error", error: err.response?.data?.message || "Failed to load session" });
        }
    },

    startSession: async (id: string) => {
        set({ status: "loading", error: null });
        try {
            const res = await startAIInterview(id);
            set({
                session: res.session,
                status: "active",
                questions: res.session.questions || [],
                transcript: res.agentData.transcript || res.session.transcript || [],
                avatarState: "speaking",
                currentSpeechText: res.agentData.greeting + " " + (res.agentData.firstQuestion?.question || ""),
                isInterviewerSpeaking: true,
                currentQuestionIndex: 0,
            });
        } catch (err: any) {
            set({ status: "error", error: err.response?.data?.message || "Failed to start interview" });
        }
    },

    sendAnswer: async (answerText: string) => {
        const { session, currentQuestionIndex } = get();
        if (!session) return;

        set({
            avatarState: "thinking",
            isInterviewerSpeaking: false,
            transcript: [
                ...get().transcript,
                { role: "candidate", content: answerText, timestamp: new Date().toISOString() },
            ],
        });

        try {
            const res = await submitAnswer(session._id, currentQuestionIndex, answerText);

            if (res.interviewStatus === "Completed" || res.nextStep === "wrapup") {
                set({
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                    status: "completed",
                });
                await get().finishInterview();
                return;
            }

            if (res.nextStep === "coding" && res.codingChallenge) {
                set({
                    status: "coding",
                    currentCodingChallenge: res.codingChallenge,
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                });
                return;
            }

            if (res.nextQuestion) {
                set({
                    questions: [...get().questions, res.nextQuestion],
                    currentQuestionIndex: get().questions.length,
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                });
            } else {
                set({
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                });
            }
        } catch (err: any) {
            console.error("Answer submission error:", err);
            set({ avatarState: "idle" });
        }
    },

    sendCode: async (code: string, language: string) => {
        const { session } = get();
        if (!session) return;

        set({ avatarState: "thinking" });
        try {
            const res = await submitCode(session._id, 0, code, language);
            set({
                status: "active",
                avatarState: "speaking",
                currentSpeechText: res.interviewerSpeech,
                isInterviewerSpeaking: true,
            });
        } catch (err) {
            set({ avatarState: "idle" });
        }
    },

    updateLiveMetrics: (confidence: number, eyeContact: number, speed?: number) => {
        const { session } = get();
        set({ confidenceScore: confidence, eyeContactScore: eyeContact });
        if (session) {
            updateMetrics(session._id, { confidence, eyeContactScore: eyeContact, speakingSpeed: speed }).catch(
                () => {}
            );
        }
    },

    finishInterview: async () => {
        const { session } = get();
        if (!session) return;

        set({ status: "loading" });
        try {
            const reportData = await completeAIInterview(session._id);
            set({ report: reportData, status: "completed" });
        } catch (err) {
            set({ status: "completed" });
        }
    },

    toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
    toggleCamera: () => set((state) => ({ isCameraOn: !state.isCameraOn })),
    setAvatarState: (avatarState) => set({ avatarState }),
    setSpeechText: (currentSpeechText) => set({ currentSpeechText }),
    tickTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
}));
