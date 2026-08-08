import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAIInterviewStore } from "../../store/useAIInterviewStore";
import { useMediaDevices } from "../../hooks/useMediaDevices";
import { useNetworkQuality } from "../../hooks/useNetworkQuality";
import {
    Camera,
    Mic,
    FileText,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Volume2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export const AIInterviewWaiting: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session, fetchSession, startSession } = useAIInterviewStore();

    // Media states & hooks
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const { stream, videoRef, hasPermission, error: mediaError } = useMediaDevices(isCameraOn, isMicOn);
    const { quality, rtt } = useNetworkQuality();

    // Real audio meter level (0 to 100)
    const [micVolume, setMicVolume] = useState<number>(0);
    const [speakerTesting, setSpeakerTesting] = useState(false);
    const [speakerTested, setSpeakerTested] = useState(false);

    // Browser compatibility checks
    const [browserCompatible, setBrowserCompatible] = useState<boolean>(true);

    // Countdown & loading
    const [countdown, setCountdown] = useState<number | null>(null);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (id) fetchSession(id);
    }, [id]);

    // Check browser compatibility
    useEffect(() => {
        const isSupported =
            Boolean(navigator.mediaDevices?.getUserMedia) &&
            Boolean(window.AudioContext || (window as any).webkitAudioContext);
        setBrowserCompatible(isSupported);
    }, []);

    // Real-time audio metering via Web Audio API on stream
    useEffect(() => {
        if (!stream) return;

        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let source: MediaStreamAudioSourceNode | null = null;
        let animationFrameId: number;

        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioContext = new AudioCtx();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                // Scale average (0-128) to 0-100%
                const volumePercent = Math.min(100, Math.round((average / 128) * 100));
                setMicVolume(volumePercent);
                animationFrameId = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (err) {
            console.error("Audio Context Metering error:", err);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (audioContext && audioContext.state !== "closed") {
                audioContext.close();
            }
        };
    }, [stream]);

    // Speaker Sound Test via Web Audio API synthesized tone
    const handleTestSpeaker = () => {
        setSpeakerTesting(true);
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 tone
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.8);

            setTimeout(() => {
                setSpeakerTesting(false);
                setSpeakerTested(true);
                toast.success("Speaker test tone played!");
            }, 800);
        } catch (err) {
            console.error("Speaker test error:", err);
            setSpeakerTesting(false);
        }
    };

    // Countdown and Start session trigger
    const handleStart = () => {
        if (!allChecksPassed) return;
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            if (id) {
                setStarting(true);
                startSession(id)
                    .then(() => {
                        navigate(`/candidate/ai-interviews/${id}/live`);
                    })
                    .catch((err) => {
                        toast.error(err?.message || "Failed to start interview session");
                        setCountdown(null);
                    })
                    .finally(() => setStarting(false));
            }
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, id]);

    // System Readiness Logic: All checks must pass before Start Interview unlocks
    const isCameraOk = hasPermission === true && isCameraOn;
    const isMicOk = hasPermission === true && isMicOn;
    const isNetworkOk = quality !== "poor";
    const allChecksPassed = isCameraOk && isMicOk && browserCompatible && isNetworkOk;

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F6F6F7] text-[#111111]">
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                    <Sparkles className="h-5 w-5 text-black animate-spin" />
                    <span className="text-xs font-semibold tracking-tight">Initializing AI Interview Waiting Room...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F6F7] text-[#111111] p-6 md:p-10 flex flex-col justify-between select-none">
            {/* Header / Brand bar */}
            <div className="flex items-center justify-between max-w-6xl mx-auto w-full pb-6 border-b border-[#ECECEC]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-black flex items-center justify-center shadow-xs font-bold text-lg text-white">
                        M
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm text-[#111111] tracking-tight">{session.job?.company || "MeritConnect"} &bull; AI Interview Room</h1>
                        <p className="text-xs text-[#6E6E73]">Position: <strong className="text-[#111111]">{session.job?.title}</strong></p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECECEC] text-xs text-[#111111] shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold">Proctored AI Assessment</span>
                </div>
            </div>

            {/* Main Grid: Device Check vs Candidate/Job Dossier */}
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">

                {/* LEFT COLUMN (7 Cols): Camera Preview & System Checks */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Camera Feed Container */}
                    <div className="relative aspect-video rounded-[28px] bg-white border border-[#ECECEC] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] group">
                        {hasPermission ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover transform -scale-x-100 transition duration-300 ${!isCameraOn ? "opacity-0" : "opacity-100"}`}
                            />
                        ) : null}

                        {(!hasPermission || !isCameraOn) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F6F6F7] text-[#6E6E73] text-xs p-6 text-center space-y-3">
                                <div className="p-4 rounded-full bg-white border border-[#ECECEC] shadow-xs">
                                    <Camera className="h-8 w-8 text-[#111111]" />
                                </div>
                                <p className="font-semibold text-[#111111]">
                                    {!hasPermission ? (mediaError || "Camera permission required") : "Camera is currently turned off"}
                                </p>
                                {!hasPermission && (
                                    <p className="text-[#6E6E73] text-[11px] max-w-xs">
                                        Please click "Allow" in your browser's prompt to grant camera & microphone access.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Top Video Status Overlay */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#ECECEC] text-xs text-[#111111] shadow-xs">
                            <span className={`h-2 w-2 rounded-full ${isCameraOk ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            <span className="font-semibold">{isCameraOk ? "Video Feed Active" : "Video Offline"}</span>
                        </div>

                        {/* Camera & Mic Toggle Overlay Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#ECECEC] shadow-xs">
                            <button
                                type="button"
                                onClick={() => setIsCameraOn(!isCameraOn)}
                                className={`p-2.5 rounded-full transition ${isCameraOn ? "bg-black text-white" : "bg-[#F6F6F7] text-[#6E6E73] hover:text-[#111111]"}`}
                                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={`p-2.5 rounded-full transition ${isMicOn ? "bg-black text-white" : "bg-[#F6F6F7] text-[#6E6E73] hover:text-[#111111]"}`}
                                title={isMicOn ? "Turn Mic Off" : "Turn Mic On"}
                            >
                                <Mic className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* System Readiness Diagnostic Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">

                        {/* 1. Camera Status */}
                        <div className="p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-[#6E6E73] text-[11px]">
                                <span>Camera</span>
                                {isCameraOk ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                            </div>
                            <p className="font-bold text-[#111111]">{isCameraOk ? "HD Ready" : "Disabled"}</p>
                        </div>

                        {/* 2. Microphone & Meter */}
                        <div className="p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between font-semibold text-[#6E6E73] text-[11px]">
                                <span>Microphone</span>
                                {isMicOk ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                            </div>
                            <div className="h-1.5 w-full bg-[#F6F6F7] rounded-full overflow-hidden border border-[#ECECEC]">
                                <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${micVolume}%` }} />
                            </div>
                        </div>

                        {/* 3. Speaker Test */}
                        <div className="p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-[#6E6E73] text-[11px]">
                                <span>Speaker Test</span>
                                {speakerTested && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            </div>
                            <button
                                type="button"
                                onClick={handleTestSpeaker}
                                disabled={speakerTesting}
                                className="text-[11px] font-bold text-black hover:underline transition flex items-center gap-1"
                            >
                                <Volume2 className="h-3 w-3" />
                                {speakerTesting ? "Playing..." : speakerTested ? "Retest Audio" : "Test Sound"}
                            </button>
                        </div>

                        {/* 4. Browser & Network */}
                        <div className="p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-[#6E6E73] text-[11px]">
                                <span>Browser / Net</span>
                                {isNetworkOk && browserCompatible ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                )}
                            </div>
                            <p className="font-bold text-[#111111] capitalize">{quality} ({rtt}ms)</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (5 Cols): Job Specs, Resume Context, Rules, Start Action */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">

                        {/* Candidate Resume & Job Overview Card */}
                        <div className="p-6 rounded-[28px] bg-white border border-[#ECECEC] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3">
                                <h3 className="font-bold text-xs text-[#111111] flex items-center gap-2 tracking-tight">
                                    <FileText className="h-4 w-4 text-[#111111]" /> Session Specifications
                                </h3>
                                <span className="px-3 py-1 rounded-full bg-[#F6F6F7] border border-[#ECECEC] text-[#111111] text-[10px] font-bold font-mono">
                                    {session.type} Round
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC]">
                                    <p className="text-[10px] font-semibold text-[#6E6E73]">Target Duration</p>
                                    <p className="text-lg font-black text-[#111111] mt-0.5">{session.config?.duration || 45} Minutes</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC]">
                                    <p className="text-[10px] font-semibold text-[#6E6E73]">Difficulty Mode</p>
                                    <p className="text-lg font-black text-emerald-600 mt-0.5">{session.config?.difficulty || "Adaptive"}</p>
                                </div>
                            </div>

                            {/* Resume & Skill Match Preview */}
                            <div>
                                <p className="text-[11px] font-semibold text-[#6E6E73] mb-1.5">Matched Resume Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(session.context?.matchingSkills || session.job?.skills || ["React", "NodeJS", "TypeScript"]).map((sk, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#F6F6F7] border border-[#ECECEC] text-[#111111] text-[11px] font-medium">
                                            {sk}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interview Conduct Rules Card */}
                        <div className="p-6 rounded-[28px] bg-white border border-[#ECECEC] space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-xs">
                            <h4 className="font-bold text-[#111111] flex items-center gap-2 tracking-tight">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Proctored Session Rules
                            </h4>
                            <ul className="space-y-2 text-[#6E6E73] list-disc list-inside leading-relaxed text-[11px]">
                                <li>Ensure you are in a quiet, well-lit room with minimal background noise.</li>
                                <li>Speak naturally into your microphone — the AI will transcribe your answers.</li>
                                <li>The AI adaptively increases question difficulty if you perform well.</li>
                                <li>Do not switch browser tabs during the session.</li>
                            </ul>
                        </div>
                    </div>

                    {/* START INTERVIEW ACTION BAR */}
                    <div className="space-y-3">
                        {!allChecksPassed && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>Please enable camera and microphone to unlock the interview session.</span>
                            </div>
                        )}

                        {countdown !== null ? (
                            <div className="flex items-center justify-center p-5 rounded-2xl bg-black text-white font-black text-2xl shadow-xl animate-pulse">
                                Starting in {countdown}...
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStart}
                                disabled={!allChecksPassed || starting}
                                className={`w-full py-4 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-3 transition transform ${allChecksPassed && !starting
                                    ? "bg-black hover:bg-neutral-800 text-white hover:scale-[1.005]"
                                    : "bg-[#F6F6F7] text-[#6E6E73] border border-[#ECECEC] cursor-not-allowed opacity-60"
                                    }`}
                            >
                                {starting ? (
                                    <>
                                        <Sparkles className="h-4 w-4 animate-spin" />
                                        <span>Connecting to AI Interviewer...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Start AI Interview</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInterviewWaiting;
