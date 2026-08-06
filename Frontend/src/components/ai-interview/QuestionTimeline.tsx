import React from "react";
import type { AIQuestion } from "../../types/aiInterview";
import { CheckCircle2, Circle, Clock, HelpCircle } from "lucide-react";

interface QuestionTimelineProps {
    questions: AIQuestion[];
    currentQuestionIndex: number;
    totalDurationMinutes?: number;
    elapsedSeconds?: number;
}

export const QuestionTimeline: React.FC<QuestionTimelineProps> = ({
    questions,
    currentQuestionIndex,
    totalDurationMinutes = 45,
    elapsedSeconds = 0,
}) => {
    const remainingSeconds = Math.max(0, totalDurationMinutes * 60 - elapsedSeconds);
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <div className="flex flex-col h-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-xl">
            {/* Header Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>Time Remaining</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800/50 text-blue-400 font-mono text-xs font-bold">
                    {formatTime(remainingSeconds)}
                </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5">
                {questions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                        Questions will appear here as the interviewer asks them.
                    </div>
                ) : (
                    questions.map((q, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isDone = q.status === "Answered";

                        return (
                            <div
                                key={idx}
                                className={`p-3 rounded-xl border text-xs transition-all ${
                                    isCurrent
                                        ? "bg-blue-950/60 border-blue-600/80 text-slate-100 shadow-lg"
                                        : isDone
                                        ? "bg-slate-800/40 border-slate-800 text-slate-400"
                                        : "bg-slate-900/40 border-slate-800/60 text-slate-500"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                        {isDone ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : isCurrent ? (
                                            <Circle className="h-3.5 w-3.5 text-blue-400 fill-blue-400 animate-pulse" />
                                        ) : (
                                            <HelpCircle className="h-3.5 w-3.5 text-slate-600" />
                                        )}
                                        Q{idx + 1}: {q.type || "Technical"}
                                    </span>
                                    {q.difficulty && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                            {q.difficulty}
                                        </span>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-slate-300">{q.question}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
