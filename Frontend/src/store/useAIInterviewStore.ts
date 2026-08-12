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
    isSubmitting: boolean;

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
    isSubmitting: false,

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
        console.log("[STEP 3: Store startSession called]", id);
        set({ status: "loading", error: null });
        try {
            console.log("[STEP 4: Invoking startAIInterview API]");
            const res = await startAIInterview(id);
            console.log("[STEP 9: API Response received in store]", res);

            const firstQ = res.agentData?.firstQuestion;
            const updatedQuestions = (res.session?.questions && res.session.questions.length > 0)
                ? res.session.questions
                : (firstQ ? [{ index: 0, question: firstQ.question, type: firstQ.type, difficulty: firstQ.difficulty, status: "Pending" }] : []);

            set({
                session: res.session,
                status: "active",
                questions: updatedQuestions as any,
                transcript: res.agentData?.transcript || res.session?.transcript || [],
                avatarState: "speaking",
                currentSpeechText: `${res.agentData?.greeting || ""} ${firstQ?.question || ""}`.trim(),
                isInterviewerSpeaking: true,
                currentQuestionIndex: 0,
            });
        } catch (err: any) {
            console.error("[STEP 3 Error in startSession]:", err);
            set({ status: "error", error: err.response?.data?.message || "Failed to start interview" });
        }
    },

    sendAnswer: async (answerText: string) => {
        if (get().isSubmitting) return;
        set({ isSubmitting: true });

        const { session, currentQuestionIndex, questions } = get();
        if (!session) {
            set({ isSubmitting: false });
            return;
        }

        const currentQ = questions[currentQuestionIndex];
        const url = `/ai-interviews/${session._id}/answer`;

        console.log("[INTERVIEW] ABOUT TO CALL ANSWER API", {
            url,
            answer: answerText,
            questionId: (currentQ as any)?._id || currentQ?.index,
            questionNumber: currentQuestionIndex + 1,
        });

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
            console.log("[INTERVIEW] ANSWER API RESPONSE", res);

            if (res.interviewStatus === "Completed" || res.nextStep === "wrapup") {
                set({
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                    status: "completed",
                    transcript: [
                        ...get().transcript,
                        { role: 'interviewer', content: res.interviewerSpeech, timestamp: new Date().toISOString() },
                    ],
                });
                await get().finishInterview();
                set({ isSubmitting: false });
                return;
            }

            if (res.nextStep === "coding" && res.codingChallenge) {
                set({
                    status: "coding",
                    currentCodingChallenge: res.codingChallenge,
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                    transcript: [
                        ...get().transcript,
                        { role: 'interviewer', content: res.interviewerSpeech, timestamp: new Date().toISOString() },
                    ],
                });
                set({ isSubmitting: false });
                return;
            }

            if (res.nextQuestion) {
                console.log("[INTERVIEW] NEXT QUESTION RECEIVED", res.nextQuestion);
                const updatedQuestions = [...get().questions, res.nextQuestion];
                const nextIndex = updatedQuestions.length - 1;
                console.log("[INTERVIEW] QUESTION NUMBER UPDATED:", nextIndex + 1);

                set({
                    questions: updatedQuestions,
                    currentQuestionIndex: nextIndex,
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                    transcript: [
                        ...get().transcript,
                        { role: 'interviewer', content: res.interviewerSpeech, timestamp: new Date().toISOString() },
                    ],
                });
            } else {
                set({
                    avatarState: "speaking",
                    currentSpeechText: res.interviewerSpeech,
                    isInterviewerSpeaking: true,
                    transcript: [
                        ...get().transcript,
                        { role: 'interviewer', content: res.interviewerSpeech, timestamp: new Date().toISOString() },
                    ],
                });
            }
        } catch (err: any) {
            console.error("[INTERVIEW] ANSWER API ERROR", err);
            set({ avatarState: "idle" });
        }
        set({ isSubmitting: false });
    },

    sendCode: async (code: string, language: string) => {
        if (get().isSubmitting) return;
        set({ isSubmitting: true });

        const { session } = get();
        if (!session) {
            set({ isSubmitting: false });
            return;
        }

        set({ avatarState: "thinking" });
        try {
            const res = await submitCode(session._id, 0, code, language);
            set({
                status: "active",
                avatarState: "speaking",
                currentSpeechText: res.interviewerSpeech,
                isInterviewerSpeaking: true,
                transcript: [
                    ...get().transcript,
                    { role: 'interviewer', content: res.interviewerSpeech, timestamp: new Date().toISOString() },
                ],
            });
        } catch (err) {
            set({ avatarState: "idle" });
        }
        set({ isSubmitting: false });
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
