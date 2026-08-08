import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAIInterviewStore } from "../../store/useAIInterviewStore";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { useInterviewTimer, formatDuration } from "../../hooks/useInterviewTimer";
import { getAIInterviewSocket } from "../../lib/socket";

import { InterviewerAvatar } from "../../components/ai-interview/InterviewerAvatar";
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
    MessageSquare,
    ChevronDown,
    Bot,
    User,
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
    } = useAIInterviewStore();

    const [writtenAnswer, setWrittenAnswer] = useState("");
    const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Hook to speak interviewer responses aloud via Speech Synthesis
    const { speak } = useSpeechSynthesis();

    // Hook to capture candidate spoken answers via Web Speech Recognition
    const {
        transcript: speechTranscript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechRecognition((finalText) => {
        setWrittenAnswer((prev) => (prev ? prev + " " + finalText : finalText));
    });

    // Fetch session on mount (supports page refresh & reconnect)
    useEffect(() => {
        console.log("[STEP 1: Interview Page Mounted]", id);
        if (id) fetchSession(id);
    }, [id]);

    // Auto-start interview agent if session is loaded and interview hasn't initialized yet
    useEffect(() => {
        if (!id || !session) return;
        console.log("[STEP 2: Evaluating session status]", session.status, "questions:", session.questions?.length);
        if (session.status === "Waiting" || session.status === "InProgress" || !session.questions || session.questions.length === 0) {
            console.log("[STEP 2a: Triggering startSession]");
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

    // Speak interviewer text aloud whenever new interviewer text arrives
    useEffect(() => {
        if (currentSpeechText && isInterviewerSpeaking) {
            console.log("[STEP 10: Triggering TTS Speech Synthesis]", currentSpeechText);
            speak(currentSpeechText);
        }
    }, [currentSpeechText, isInterviewerSpeaking]);

    // Auto-listen when mic is enabled and interviewer is quiet
    useEffect(() => {
        if (isMicOn && !isInterviewerSpeaking && (status === "active" || status === "coding")) {
            startListening();
        } else {
            stopListening();
        }
    }, [isMicOn, isInterviewerSpeaking, status]);

    // Auto-scroll transcript drawer to bottom
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [storeTranscript, showTranscriptDrawer]);

    // Candidate submits answer (via voice STT or text)
    const handleSendAnswer = async () => {
        const finalAns = (writtenAnswer || speechTranscript).trim();
        if (!finalAns) {
            toast.error("Please enter or speak your answer before submitting.");
            return;
        }

        setWrittenAnswer("");
        resetTranscript();

        // Emit telemetry over Socket.IO
        const socket = getAIInterviewSocket();
        if (socket.connected && id) {
            socket.emit("candidate:speech", {
                aiInterviewId: id,
                text: finalAns,
                isFinal: true,
            });
            socket.emit("candidate:telemetry", {
                aiInterviewId: id,
                eyeContactScore,
                confidenceScore,
                speakingSpeed: 130,
            });
        }

        await sendAnswer(finalAns);
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
            {/* Top Bar Navigation - Apple HIG Bar */}
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

                {/* Status Telemetry & Controls */}
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
                        onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${showTranscriptDrawer ? "bg-black border-black text-white" : "bg-white border-[#ECECEC] text-[#111111] hover:bg-[#F6F6F7]"
                            }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Transcript</span>
                    </button>

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

                {/* Main Interactive Stage (Takes 3/4 Width) */}
                <div className="lg:col-span-3 flex flex-col h-full space-y-4 overflow-hidden">
                    {status === "coding" && currentCodingChallenge ? (
                        /* Interactive Coding Environment Mode */
                        <div className="flex-1 overflow-hidden">
                            <CodingEnvironment
                                challenge={currentCodingChallenge}
                                onSubmit={(code, lang) => sendCode(code, lang)}
                            />
                        </div>
                    ) : (
                        /* Live Video Stage (Interviewer Avatar + Candidate Feed) */
                        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 gap-4 overflow-hidden">
                            {/* AI Interviewer Avatar (Takes 2/3 space) */}
                            <div className="md:col-span-2 h-full overflow-hidden">
                                <InterviewerAvatar
                                    avatarState={avatarState}
                                    isSpeaking={isInterviewerSpeaking}
                                    speechText={currentSpeechText}
                                    className="h-full w-full"
                                />
                            </div>

                            {/* Candidate Selfie Stream (Takes 1/3 space) */}
                            <div className="md:col-span-1 h-full overflow-hidden">
                                <CandidateVideo
                                    isCameraOn={isCameraOn}
                                    isMicOn={isMicOn}
                                    candidateName={session.candidate?.name}
                                    confidenceScore={confidenceScore}
                                    className="h-full w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Candidate Answer Input & Control Dock - Apple HIG Dock */}
                    <div className="p-3 bg-white border border-[#ECECEC] rounded-[24px] flex items-center gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
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

                        {/* Spoken / Typed Answer Input Box */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={writtenAnswer}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                                placeholder={isListening ? "Listening to your speech... (speak naturally or type response)" : "Type your answer or speak into microphone..."}
                                className="w-full bg-[#F6F6F7] border border-[#ECECEC] rounded-2xl px-4 py-3 text-xs text-[#111111] placeholder-[#6E6E73] outline-none focus:border-black transition"
                            />
                            {isListening && (
                                <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping" title="Voice Recognition Active" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSendAnswer}
                            className="px-5 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition"
                        >
                            <span>Send</span> <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* TRANSCRIPT OVERLAY DRAWER - Apple HIG Drawer */}
                {showTranscriptDrawer && (
                    <div className="absolute right-4 top-4 bottom-20 w-full max-w-md rounded-[28px] bg-white border border-[#ECECEC] shadow-2xl p-5 flex flex-col z-40 backdrop-blur-xl animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-[#ECECEC]">
                            <h3 className="font-semibold text-xs text-[#111111] flex items-center gap-2 tracking-tight">
                                <MessageSquare className="h-4 w-4 text-[#111111]" /> Live Conversation Transcript
                            </h3>
                            <button onClick={() => setShowTranscriptDrawer(false)} className="text-[#6E6E73] hover:text-[#111111]">
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                            {storeTranscript.length === 0 ? (
                                <p className="text-[#6E6E73] text-center py-8">Transcript exchanges will appear here as you speak.</p>
                            ) : (
                                storeTranscript.map((entry, idx) => {
                                    const isInterviewer = entry.role === "interviewer";
                                    return (
                                        <div key={idx} className={`flex items-start gap-2 ${isInterviewer ? "justify-start" : "justify-end"}`}>
                                            {isInterviewer && (
                                                <div className="p-1.5 rounded-xl bg-[#F6F6F7] border border-[#ECECEC] text-[#111111] shrink-0">
                                                    <Bot className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                            <div className={`p-3.5 rounded-2xl max-w-[85%] ${isInterviewer ? "bg-[#F6F6F7] border border-[#ECECEC] text-[#111111]" : "bg-black text-white"}`}>
                                                <p className={`text-[10px] font-semibold mb-0.5 ${isInterviewer ? "text-[#6E6E73]" : "text-neutral-300"}`}>{isInterviewer ? "Alex (AI Interviewer)" : "You"}</p>
                                                <p className="leading-relaxed">{entry.content}</p>
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
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInterviewLive;
