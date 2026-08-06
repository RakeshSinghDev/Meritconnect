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
    ChevronUp,
    Bot,
    User,
    Volume2,
    Shield,
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
        if (id) fetchSession(id);
    }, [id]);

    // Auto-start interview agent if session is loaded and interview hasn't initialized yet
    useEffect(() => {
        if (!id || !session) return;
        if (session.status === "Pending" || !session.questions || session.questions.length === 0) {
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
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-blue-400 animate-spin" />
                    <span className="text-sm font-semibold">Connecting to AI Interviewer Session...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 border-b border-slate-800 shadow-md backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                        M
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-slate-200">{session.job?.company || "MeritConnect"} AI Interview</h2>
                        <p className="text-[11px] text-slate-400">Role: <strong className="text-slate-300">{session.job?.title}</strong></p>
                    </div>
                </div>

                {/* Status Telemetry & Controls */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        {formatDuration(elapsedSeconds)} / {session.config?.duration || 45}:00
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-slate-400">
                        <Activity className="h-4 w-4 text-emerald-400" />
                        <span>Confidence: <strong className="text-slate-200">{confidenceScore}%</strong></span>
                    </div>

                    <button
                        onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${showTranscriptDrawer ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                            }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Transcript</span>
                    </button>

                    <button
                        onClick={handleEndInterview}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs transition shadow-lg"
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

                    {/* Candidate Answer Input & Control Dock */}
                    <div className="p-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md">
                        <button
                            type="button"
                            onClick={toggleMic}
                            aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                            className={`p-3 rounded-xl border transition ${isMicOn ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-rose-950 border-rose-800 text-rose-400"
                                }`}
                            title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                        >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </button>

                        <button
                            type="button"
                            onClick={toggleCamera}
                            aria-label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                            className={`p-3 rounded-xl border transition ${isCameraOn ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-rose-950 border-rose-800 text-rose-400"
                                }`}
                            title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                        >
                            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </button>

                        {/* Spoken / Typed Answer Input Box */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={writtenAnswer}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                                placeholder={isListening ? "Listening to your voice... (or type your response)" : "Type your answer or speak into microphone..."}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-600 transition"
                            />
                            {isListening && (
                                <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" title="Voice Recognition Listening" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSendAnswer}
                            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                        >
                            <span>Submit Response</span> <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* TRANSCRIPT OVERLAY DRAWER */}
                {showTranscriptDrawer && (
                    <div className="absolute right-4 top-4 bottom-20 w-full max-w-md rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-4 flex flex-col z-40 backdrop-blur-xl animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-xs text-blue-400 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Live Conversation Transcript
                            </h3>
                            <button onClick={() => setShowTranscriptDrawer(false)} className="text-slate-400 hover:text-white">
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                            {storeTranscript.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">Transcript exchanges will appear here as you speak.</p>
                            ) : (
                                storeTranscript.map((entry, idx) => {
                                    const isInterviewer = entry.role === "interviewer";
                                    return (
                                        <div key={idx} className={`flex items-start gap-2 ${isInterviewer ? "justify-start" : "justify-end"}`}>
                                            {isInterviewer && (
                                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                                                    <Bot className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                            <div className={`p-3 rounded-2xl max-w-[85%] ${isInterviewer ? "bg-slate-950 border border-slate-800 text-slate-200" : "bg-blue-950/60 border border-blue-800/60 text-blue-100"}`}>
                                                <p className="text-[10px] font-bold text-slate-400 mb-0.5">{isInterviewer ? "Alex (AI Interviewer)" : "You"}</p>
                                                <p className="leading-relaxed">{entry.content}</p>
                                            </div>
                                            {!isInterviewer && (
                                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
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
