import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { InterviewerAvatarState } from "../../store/useAIInterviewStore";

interface InterviewerAvatarProps {
    avatarState: InterviewerAvatarState;
    isSpeaking: boolean;
    speechText?: string;
    className?: string;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
    avatarState,
    isSpeaking,
    speechText = "",
    className = "",
}) => {
    const [mouthOpen, setMouthOpen] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

    // Rapid viseme mouth oscillation during speech
    useEffect(() => {
        if (!isSpeaking) {
            setMouthOpen(false);
            return;
        }

        const interval = setInterval(() => {
            setMouthOpen((prev) => !prev);
        }, 130 + Math.random() * 80);

        return () => clearInterval(interval);
    }, [isSpeaking]);

    // Random human blinking behavior
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 180);
        }, 3500 + Math.random() * 2000);

        return () => clearInterval(blinkInterval);
    }, []);

    // Subtle eye movements
    useEffect(() => {
        const eyeDriftInterval = setInterval(() => {
            if (avatarState === "thinking") {
                setEyeOffset({ x: -2, y: -3 }); // Look slightly up and left when thinking
            } else {
                setEyeOffset({
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 1.5,
                });
            }
        }, 2500);

        return () => clearInterval(eyeDriftInterval);
    }, [avatarState]);

    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-zinc-950 shadow-2xl border border-slate-700/50 ${className}`}>
            {/* Ambient Office Background Blur */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-transparent" />

            {/* Subtle grid accent for corporate executive background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {/* Main Avatar Graphic - Modern Senior Engineering Manager (Alex Vance) */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-end w-full h-full pt-6"
                animate={{
                    y: avatarState === "thinking" ? [0, -3, 0] : [0, -4, 0],
                    rotate: avatarState === "thinking" ? [0, 1.5, 0] : [0, 0.5, 0],
                }}
                transition={{
                    repeat: Infinity,
                    duration: avatarState === "thinking" ? 3 : 4,
                    ease: "easeInOut",
                }}
            >
                {/* Status Indicator Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-medium text-slate-200">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isSpeaking
                                ? "bg-emerald-400 animate-ping"
                                : avatarState === "thinking"
                                ? "bg-amber-400 animate-pulse"
                                : "bg-blue-400"
                        }`}
                    />
                    {isSpeaking
                        ? "Speaking..."
                        : avatarState === "thinking"
                        ? "Evaluating answer..."
                        : "Listening attentively"}
                </div>

                {/* Avatar SVG Composition */}
                <svg viewBox="0 0 400 480" className="w-full h-full max-h-[440px] drop-shadow-2xl">
                    <defs>
                        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f3d0b7" />
                            <stop offset="100%" stopColor="#e2b498" />
                        </linearGradient>
                    </defs>

                    {/* Torso / Professional Navy Suit */}
                    <path
                        d="M 80 480 C 80 340, 120 300, 200 300 C 280 300, 320 340, 320 480 Z"
                        fill="url(#suitGrad)"
                    />
                    {/* Inner Collar & Shirt */}
                    <path d="M 160 300 L 200 370 L 240 300 Z" fill="url(#shirtGrad)" />
                    <path d="M 195 330 L 205 330 L 202 480 L 198 480 Z" fill="#94a3b8" />

                    {/* Neck */}
                    <rect x="175" y="240" width="50" height="70" rx="10" fill="url(#skinGrad)" />
                    <path d="M 175 270 C 190 285, 210 285, 225 270" fill="none" stroke="#d49b7b" strokeWidth="2.5" opacity="0.6" />

                    {/* Head */}
                    <rect x="130" y="70" width="140" height="180" rx="65" fill="url(#skinGrad)" />

                    {/* Hair (Senior Professional Trim) */}
                    <path
                        d="M 125 120 C 120 60, 180 35, 200 35 C 230 35, 280 60, 275 120 C 260 80, 220 50, 200 50 C 180 50, 140 80, 125 120 Z"
                        fill="#334155"
                    />

                    {/* Eyebrows */}
                    <path
                        d={avatarState === "thinking" ? "M 150 122 Q 165 116 180 126" : "M 150 125 Q 165 120 180 125"}
                        stroke="#1e293b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M 220 125 Q 235 120 250 125"
                        stroke="#1e293b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Eyes */}
                    {!isBlinking ? (
                        <>
                            {/* Left Eye */}
                            <ellipse cx="165" cy="145" rx="12" ry="7" fill="#ffffff" />
                            <circle cx={165 + eyeOffset.x} cy={145 + eyeOffset.y} r="5" fill="#0f172a" />
                            <circle cx={163 + eyeOffset.x} cy={143 + eyeOffset.y} r="1.5" fill="#ffffff" />

                            {/* Right Eye */}
                            <ellipse cx="235" cy="145" rx="12" ry="7" fill="#ffffff" />
                            <circle cx={235 + eyeOffset.x} cy={145 + eyeOffset.y} r="5" fill="#0f172a" />
                            <circle cx={233 + eyeOffset.x} cy={143 + eyeOffset.y} r="1.5" fill="#ffffff" />
                        </>
                    ) : (
                        <>
                            {/* Blinking lines */}
                            <path d="M 153 145 Q 165 150 177 145" stroke="#1e293b" strokeWidth="3" fill="none" />
                            <path d="M 223 145 Q 235 150 247 145" stroke="#1e293b" strokeWidth="3" fill="none" />
                        </>
                    )}

                    {/* Glasses (Modern Executive Frames) */}
                    <rect x="145" y="132" width="40" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="3" />
                    <rect x="215" y="132" width="40" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="3" />
                    <line x1="185" y1="142" x2="215" y2="142" stroke="#475569" strokeWidth="3" />

                    {/* Nose */}
                    <path d="M 200 145 L 195 185 L 205 185" fill="none" stroke="#d49b7b" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Mouth (Dynamic Viseme Lip Sync) */}
                    {mouthOpen ? (
                        /* Open mouth when speaking */
                        <ellipse cx="200" cy="212" rx="14" ry="9" fill="#7f1d1d" stroke="#1e293b" strokeWidth="2" />
                    ) : (
                        /* Smile / Neutral mouth when quiet */
                        <path
                            d={avatarState === "encouraging" ? "M 182 210 Q 200 225 218 210" : "M 185 212 Q 200 218 215 212"}
                            fill="none"
                            stroke="#881337"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                        />
                    )}
                </svg>
            </motion.div>

            {/* Subtitle / Closed Caption overlay inside avatar panel */}
            {speechText && isSpeaking && (
                <div className="absolute bottom-4 left-6 right-6 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-center text-sm font-medium text-slate-100 leading-relaxed"
                    >
                        "{speechText}"
                    </motion.div>
                </div>
            )}
        </div>
    );
};
