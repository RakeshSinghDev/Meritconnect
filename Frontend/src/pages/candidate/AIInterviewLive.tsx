import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAIInterviewStore } from "../../store/useAIInterviewStore";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { useInterviewTimer, formatDuration } from "../../hooks/useInterviewTimer";
import { getAIInterviewSocket } from "../../lib/socket";

import { AIInterviewerPanel } from "../../components/ai-interview/AIInterviewerPanel";
import { CandidateVideo } from "../../components/ai-interview/CandidateVideo";
import { QuestionTimeline } from "../../components/ai-interview/QuestionTimeline";
import { CodingEnvironment } from "../../components/ai-interview/CodingEnvironment";

import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Send,
    PhoneOff,
    Sparkles,
    Activity,
    Bot,
    User,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export const AIInterviewLive: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        session,
        status,
        fetchSession,
        avatarState,
        currentSpeechText,
        isInterviewerSpeaking,
        isMicOn,
        isCameraOn,
        elapsedSeconds,
        confidenceScore,
        eyeContactScore,
        questions,
        transcript: storeTranscript,
        currentQuestionIndex,
        currentCodingChallenge,
        sendAnswer,
        sendCode,
        toggleMic,
        toggleCamera,
        setAvatarState,
        setSpeechText,
        tickTimer,
        isSubmitting,
    } = useAIInterviewStore() as any;

    const [writtenAnswer, setWrittenAnswer] = useState("");
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // TTS Hook with completion callback to transition state from AI_SPEAKING -> LISTENING
    const { speak, stop: stopTTS } = useSpeechSynthesis(undefined, () => {
        console.log("[Interview] TTS finished speaking — transitioning state to LISTENING");
        useAIInterviewStore.setState({ isInterviewerSpeaking: false, avatarState: "listening" });
    });

    // Voice Recognition Hook with automatic speech-end detection and debug logging
    const {
        transcript: speechTranscript,
        interimTranscript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechRecognition({
        onFinalTranscript: (text) => {
            console.log("[INTERVIEW] Speech result:", { transcript: text, isFinal: true });
            setWrittenAnswer(text);
        },
        onSpeechEnd: (finalText) => {
            console.log("[INTERVIEW] Final transcript:", finalText);
            console.log("[INTERVIEW] Speech recognition ended");
            handleSendAnswer(finalText);
        },
    });

    // Fetch session on mount
    useEffect(() => {
        console.log("[INTERVIEW] Page Mounted with session ID:", id);
        if (id) fetchSession(id);
    }, [id]);

    // Auto-start interview agent ONLY IF interview hasn't initialized yet
    useEffect(() => {
        if (!id || !session) return;
        console.log("[INTERVIEW] Evaluating session status:", session.status, "questions length:", session.questions?.length);
        if (session.status === "Waiting" || !session.questions || session.questions.length === 0) {
            console.log("[INTERVIEW] Initializing opening question via startSession");
            useAIInterviewStore.getState().startSession(id);
        }
    }, [id, session?.status, session?.questions?.length]);

    // Socket.IO real-time connection & event subscriptions
    useEffect(() => {
        if (!id) return;

        const socket = getAIInterviewSocket();
        socket.connect();

        socket.emit("join-interview", {
            aiInterviewId: id,
            candidateName: session?.candidate?.name || "Candidate",
        });

        socket.on("interviewer:speaking", (data: { isSpeaking: boolean; text?: string }) => {
            if (data.text) {
                setSpeechText(data.text);
            }
            useAIInterviewStore.setState({
                isInterviewerSpeaking: data.isSpeaking,
                avatarState: data.isSpeaking ? "speaking" : "listening",
            });
        });

        socket.on("interview:codingStarted", (data: { challenge: any }) => {
            useAIInterviewStore.setState({
                status: "coding",
                currentCodingChallenge: data.challenge,
            });
            toast.success("Interactive Coding Challenge started!");
        });

        socket.on("interview:completed", () => {
            toast.success("Interview session completed!");
            navigate(`/candidate/ai-interviews/${id}/report`);
        });

        return () => {
            socket.off("interviewer:speaking");
            socket.off("interview:codingStarted");
            socket.off("interview:completed");
            socket.disconnect();
        };
    }, [id, session?.candidate?.name]);

    // Timer tick loop
    useInterviewTimer(status === "active" || status === "coding", tickTimer);

    // Speak interviewer text aloud whenever new text arrives
    useEffect(() => {
        if (currentSpeechText && isInterviewerSpeaking) {
            console.log("[INTERVIEW] Triggering TTS speech for AI text:", currentSpeechText);
            speak(currentSpeechText, () => {
                console.log("[INTERVIEW] Per-call TTS finished — switching avatar state to listening");
                useAIInterviewStore.setState({ isInterviewerSpeaking: false, avatarState: "listening" });
            });
        }
    }, [currentSpeechText]);

    // Auto-listen control based on State Machine:
    useEffect(() => {
        if (isMicOn && !isInterviewerSpeaking && !isSubmitting && (status === "active" || status === "coding")) {
            console.log("[INTERVIEW] Speech recognition started");
            startListening();
        } else {
            stopListening();
        }
    }, [isMicOn, isInterviewerSpeaking, isSubmitting, status]);

    // Auto-scroll transcript to bottom
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [storeTranscript, isSubmitting, interimTranscript]);

    // Unified Answer Submission Routine (Voice STT auto-submit or manual Text Send)
    const handleSendAnswer = async (overrideText?: string) => {
        console.log("[INTERVIEW] submitAnswer() CALLED");

        const currentQ = questions[currentQuestionIndex];
        console.log("[INTERVIEW] Current question:", currentQ?.question || currentQ);

        const candidateText = (overrideText || writtenAnswer || speechTranscript || "").trim();

        console.log("[INTERVIEW] Submitting answer:", {
            questionId: currentQ?._id || currentQ?.index,
            questionNumber: currentQuestionIndex + 1,
            answer: candidateText,
        });

        if (isSubmitting) {
            console.log("[INTERVIEW] Submission blocked — already submitting");
            return;
        }

        if (!candidateText) {
            if (overrideText !== undefined) {
                console.log("[INTERVIEW] Speech-end triggered with empty transcript — skipping submission");
            } else {
                toast.error("Please enter or speak your answer before submitting.");
            }
            return;
        }

        // Lock inputs & stop microphone / TTS audio
        stopListening();
        stopTTS();

        // Reset inputs & voice buffers
        setWrittenAnswer("");
        resetTranscript();

        // Emit real-time telemetry over Socket.IO
        const socket = getAIInterviewSocket();
        if (socket.connected && id) {
            socket.emit("candidate:speech", {
                aiInterviewId: id,
                text: candidateText,
                isFinal: true,
            });
            socket.emit("candidate:telemetry", {
                aiInterviewId: id,
                eyeContactScore,
                confidenceScore,
                speakingSpeed: 130,
            });
        }

        await sendAnswer(candidateText);
    };

    const handleEndInterview = async () => {
        if (!window.confirm("Are you sure you want to end the interview now? Your report will be generated based on answered questions.")) {
            return;
        }
        if (id) {
            await useAIInterviewStore.getState().finishInterview();
            navigate(`/candidate/ai-interviews/${id}/report`);
        }
    };

    if (status === "completed") {
        navigate(`/candidate/ai-interviews/${id}/report`);
    }

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F6F6F7] text-[#111111]">
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                    <Sparkles className="h-5 w-5 text-black animate-spin" />
                    <span className="text-xs font-semibold tracking-tight">Connecting to AI Interviewer Session...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F6F6F7] text-[#111111] overflow-hidden select-none">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#ECECEC] shadow-xs z-30">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center font-bold text-sm text-white shadow-xs">
                        M
                    </div>
                    <div>
                        <h2 className="font-semibold text-xs text-[#111111] tracking-tight">{session.job?.company || "MeritConnect"} AI Interview</h2>
                        <p className="text-[11px] text-[#6E6E73]">Role: <strong className="text-[#111111]">{session.job?.title}</strong></p>
                    </div>
                </div>

                {/* Telemetry & Timer */}
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F6F7] border border-[#ECECEC] font-mono text-[#111111]">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {formatDuration(elapsedSeconds)} / {session.config?.duration || 45}:00
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[#6E6E73]">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        <span>Confidence: <strong className="text-[#111111]">{confidenceScore}%</strong></span>
                    </div>

                    <button
                        onClick={handleEndInterview}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-xs"
                    >
                        <PhoneOff className="h-3.5 w-3.5" /> End Round
                    </button>
                </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 p-4 gap-4 overflow-hidden relative">

                {/* Left Timeline (Question Progress) */}
                <div className="hidden lg:block lg:col-span-1 h-full overflow-hidden">
                    <QuestionTimeline
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        totalDurationMinutes={session.config?.duration || 45}
                        elapsedSeconds={elapsedSeconds}
                    />
                </div>

                {/* Main Interactive Stage */}
                <div className="lg:col-span-3 flex flex-col h-full space-y-4 overflow-hidden relative">
                    {status === "coding" && currentCodingChallenge ? (
                        /* Interactive Coding Environment Mode */
                        <div className="flex-1 overflow-hidden">
                            <CodingEnvironment
                                challenge={currentCodingChallenge}
                                onSubmit={(code, lang) => sendCode(code, lang)}
                            />
                        </div>
                    ) : (
                        /* Live Stage (AI Orb Panel + Conversation Area) */
                        <div className="flex-1 flex flex-col rounded-[24px] border border-[#ECECEC] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden relative">
                            {/* AI Panel (Top 1/2 height) */}
                            <div className="h-1/2 overflow-hidden border-b border-[#ECECEC]">
                                <AIInterviewerPanel
                                    avatarState={isSubmitting ? "thinking" : avatarState}
                                    isSpeaking={isInterviewerSpeaking}
                                    speechText={currentSpeechText}
                                    currentQuestion={questions[currentQuestionIndex]?.question}
                                    questionNumber={currentQuestionIndex + 1}
                                    questionType={questions[currentQuestionIndex]?.type}
                                    questionDifficulty={questions[currentQuestionIndex]?.difficulty}
                                    className="h-full w-full"
                                />
                            </div>

                            {/* Conversation Area (Bottom 1/2 height) */}
                            <div className="h-1/2 overflow-y-auto p-5 space-y-4 bg-white relative">
                                {storeTranscript.length === 0 ? (
                                    <p className="text-[#6E6E73] text-center py-8 text-xs">Transcript exchanges will appear here as you speak.</p>
                                ) : (
                                    storeTranscript.map((entry: any, idx: number) => {
                                        const isInterviewer = entry.role === "interviewer" || entry.role === "agent";
                                        return (
                                            <div key={idx} className={`flex items-start gap-2 ${isInterviewer ? "justify-start" : "justify-end"}`}>
                                                {isInterviewer && (
                                                    <div className="p-1.5 rounded-xl bg-[#F6F6F7] border border-[#ECECEC] text-[#111111] shrink-0">
                                                        <Bot className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                                <div className={`p-3.5 rounded-2xl max-w-[85%] ${isInterviewer ? "bg-[#F6F6F7] border border-[#ECECEC] text-[#111111]" : "bg-black text-white"}`}>
                                                    <p className={`text-[10px] font-semibold mb-0.5 ${isInterviewer ? "text-[#6E6E73]" : "text-neutral-300"}`}>
                                                        {isInterviewer ? "MeritConnect AI" : "You"}
                                                    </p>
                                                    <p className="leading-relaxed text-xs">{entry.content}</p>
                                                </div>
                                                {!isInterviewer && (
                                                    <div className="p-1.5 rounded-xl bg-black text-white shrink-0">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}

                                {/* Live Interim Speech Indicator */}
                                {isListening && interimTranscript && (
                                    <div className="flex items-start gap-2 justify-end opacity-80">
                                        <div className="p-3 rounded-2xl bg-neutral-900 text-white max-w-[85%] border border-neutral-700">
                                            <p className="text-[10px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Speaking...
                                            </p>
                                            <p className="leading-relaxed text-xs italic">{interimTranscript}</p>
                                        </div>
                                        <div className="p-1.5 rounded-xl bg-black text-white shrink-0">
                                            <User className="h-3.5 w-3.5 animate-pulse" />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Analyzing Response Processing Indicator */}
                                {isSubmitting && (
                                    <div className="flex items-start gap-2">
                                        <div className="p-1.5 rounded-xl bg-[#F6F6F7] border border-[#ECECEC]">
                                            <Bot className="h-3.5 w-3.5 animate-spin text-amber-500" />
                                        </div>
                                        <div className="p-3.5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] flex items-center gap-2">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                                            <span className="text-xs text-[#6E6E73] font-medium">Analyzing your response & generating adaptive question...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={transcriptEndRef} />
                            </div>
                        </div>
                    )}

                    {/* Candidate Video PiP Overlay */}
                    <div className="absolute bottom-24 right-6 z-20 w-40 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white/80">
                        <CandidateVideo
                            isCameraOn={isCameraOn}
                            isMicOn={isMicOn}
                            candidateName={session.candidate?.name}
                            confidenceScore={confidenceScore}
                            className="h-full w-full"
                        />
                    </div>

                    {/* Dock Controls & Input */}
                    <div className="p-3 bg-white border border-[#ECECEC] rounded-[24px] flex items-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] z-30">
                        <button
                            type="button"
                            onClick={toggleMic}
                            aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                            className={`p-3 rounded-2xl border transition ${isMicOn ? "bg-[#F6F6F7] border-[#ECECEC] text-[#111111]" : "bg-rose-50 border-rose-200 text-rose-600"
                                }`}
                            title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                        >
                            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={toggleCamera}
                            aria-label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                            className={`p-3 rounded-2xl border transition ${isCameraOn ? "bg-[#F6F6F7] border-[#ECECEC] text-[#111111]" : "bg-rose-50 border-rose-200 text-rose-600"
                                }`}
                            title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                        >
                            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </button>

                        {/* Input Box */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={writtenAnswer || interimTranscript}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleSendAnswer()}
                                placeholder={
                                    isSubmitting
                                        ? "Analyzing your response..."
                                        : isListening
                                        ? "Listening attentively... (speak naturally or type response)"
                                        : "Type your answer or unmute microphone to speak..."
                                }
                                disabled={isSubmitting}
                                className={`w-full bg-[#F6F6F7] border border-[#ECECEC] rounded-2xl px-4 py-3 text-xs text-[#111111] placeholder-[#6E6E73] outline-none focus:border-black transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {isListening && !isSubmitting && (
                                <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping" title="Voice Recognition Active" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleSendAnswer()}
                            disabled={isSubmitting}
                            className={`px-5 py-3 rounded-2xl font-semibold text-xs flex items-center gap-2 shadow-xs transition ${
                                isSubmitting
                                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                    : 'bg-black hover:bg-neutral-800 text-white'
                            }`}
                        >
                            <span>Send</span> <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInterviewLive;

