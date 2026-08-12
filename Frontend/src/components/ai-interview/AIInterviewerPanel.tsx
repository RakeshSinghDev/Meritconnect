import React from 'react';
import { motion } from 'framer-motion';
import type { InterviewerAvatarState } from '../../store/useAIInterviewStore';
import { Sparkles, Brain, Bot, Mic } from 'lucide-react';

interface AIInterviewerPanelProps {
    avatarState: InterviewerAvatarState;
    isSpeaking: boolean;
    speechText?: string;
    currentQuestion?: string;
    questionNumber?: number;
    questionType?: string;
    questionDifficulty?: string;
    className?: string;
}

export const AIInterviewerPanel: React.FC<AIInterviewerPanelProps> = ({
    avatarState,
    isSpeaking,
    speechText,
    currentQuestion,
    questionNumber,
    questionType,
    questionDifficulty,
    className = '',
}) => {
    const getStatusConfig = () => {
        switch (avatarState) {
            case 'speaking':
                return {
                    text: 'Speaking...',
                    dotColor: 'bg-black',
                    coreGradient: 'from-gray-900 to-black',
                    ringColor: 'border-black/10',
                    shadow: 'shadow-[0_0_40px_rgba(0,0,0,0.3)]',
                    icon: <Mic className="w-4 h-4 text-white" />
                };
            case 'thinking':
                return {
                    text: 'Evaluating response...',
                    dotColor: 'bg-amber-500',
                    coreGradient: 'from-amber-400 to-amber-600',
                    ringColor: 'border-amber-500/20',
                    shadow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
                    icon: <Brain className="w-4 h-4 text-white" />
                };
            case 'listening':
                return {
                    text: 'Listening attentively',
                    dotColor: 'bg-emerald-500',
                    coreGradient: 'from-emerald-400 to-emerald-600',
                    ringColor: 'border-emerald-500/20',
                    shadow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
                    icon: <Bot className="w-4 h-4 text-white" />
                };
            case 'encouraging':
                return {
                    text: 'Encouraging',
                    dotColor: 'bg-blue-500',
                    coreGradient: 'from-blue-400 to-blue-600',
                    ringColor: 'border-blue-500/20',
                    shadow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]',
                    icon: <Sparkles className="w-4 h-4 text-white" />
                };
            case 'idle':
            default:
                return {
                    text: 'Ready',
                    dotColor: 'bg-gray-400',
                    coreGradient: 'from-gray-300 to-gray-400',
                    ringColor: 'border-gray-300/30',
                    shadow: 'shadow-[0_0_30px_rgba(156,163,175,0.2)]',
                    icon: <Bot className="w-4 h-4 text-white" />
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`relative flex flex-col items-center justify-center bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 overflow-hidden min-h-[400px] ${className}`}>
            {/* Top Bar: Question Context & Status */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                {/* Question Context */}
                {questionNumber ? (
                    <div className="flex items-center space-x-3 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-[#ECECEC]">
                        <span className="text-sm font-semibold text-[#111111]">
                            Q{questionNumber}
                        </span>
                        {questionType && (
                            <span className="text-xs font-medium text-[#6E6E73] capitalize border-l border-gray-200 pl-3">
                                {questionType}
                            </span>
                        )}
                        {questionDifficulty && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                questionDifficulty.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                questionDifficulty.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                                {questionDifficulty}
                            </span>
                        )}
                    </div>
                ) : <div />}

                {/* Status Badge */}
                <div className="flex items-center space-x-2 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-[#ECECEC]">
                    <div className="relative flex h-2 w-2">
                        {avatarState !== 'idle' && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
                    </div>
                    <span className="text-xs font-medium text-[#6E6E73]">
                        {config.text}
                    </span>
                </div>
            </div>

            {/* Main AI Orb Visualization */}
            <div className="relative flex items-center justify-center w-64 h-64 my-8">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute w-full h-full rounded-full border border-dashed ${config.ringColor} opacity-50`}
                />

                {/* Middle Ring (Pulsing) */}
                <motion.div
                    animate={
                        avatarState === 'speaking' ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } :
                        avatarState === 'listening' ? { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] } :
                        { scale: 1, opacity: 0.2 }
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute w-48 h-48 rounded-full border-2 ${config.ringColor}`}
                />

                {/* Inner Core */}
                <motion.div
                    animate={
                        avatarState === 'speaking' ? { scale: [0.95, 1.05, 0.95] } :
                        avatarState === 'thinking' ? { scale: [1, 1.02, 1], rotate: [0, 5, -5, 0] } :
                        { scale: 1 }
                    }
                    transition={{ duration: avatarState === 'speaking' ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`relative z-10 w-24 h-24 rounded-full bg-gradient-to-br ${config.coreGradient} ${config.shadow} flex items-center justify-center`}
                >
                    {config.icon}
                </motion.div>

                {/* Orbiting Particles */}
                {avatarState === 'thinking' && (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute w-32 h-32 rounded-full border border-transparent"
                        >
                            <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute w-40 h-40 rounded-full border border-transparent"
                        >
                            <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 -mr-1 bg-amber-300 rounded-full shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                        </motion.div>
                    </>
                )}
            </div>

            {/* Current Question */}
            {currentQuestion && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg mt-4 mb-12 bg-[#F6F6F7] rounded-2xl p-4 border border-[#ECECEC] text-center"
                >
                    <p className="text-sm font-medium text-[#111111] leading-relaxed">
                        {currentQuestion}
                    </p>
                </motion.div>
            )}

            {/* Subtitle Overlay (Speech Text) */}
            {isSpeaking && speechText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-8 left-8 right-8 flex justify-center z-20"
                >
                    <div className="bg-white/95 backdrop-blur-md border border-[#ECECEC] shadow-lg rounded-2xl px-6 py-4 max-w-2xl w-full text-center">
                        <p className="text-sm text-[#111111] font-medium leading-relaxed">
                            {speechText}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
