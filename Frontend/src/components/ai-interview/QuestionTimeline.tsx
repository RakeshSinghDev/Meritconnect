import React from "react";
import type { AIQuestion } from "../../types/aiInterview";
import { CheckCircle2, Circle, Clock, HelpCircle } from "lucide-react";

interface QuestionTimelineProps {
    questions: AIQuestion[];
    currentQuestionIndex: number;
    totalDurationMinutes?: number;
    elapsedSeconds?: number;
}

export const QuestionTimeline = React.memo<QuestionTimelineProps>(({
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
        <div className="flex flex-col h-full rounded-[28px] bg-white border border-[#ECECEC] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* Header Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                <div className="flex items-center gap-2 text-[#111111] font-semibold text-xs tracking-tight">
                    <Clock className="h-4 w-4 text-[#111111]" />
                    <span>Time Remaining</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#F6F6F7] border border-[#ECECEC] text-[#111111] font-mono text-xs font-bold">
                    {formatTime(remainingSeconds)}
                </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5">
                {questions.length === 0 ? (
                    <div className="text-center py-8 text-[#6E6E73] text-xs">
                        Questions will appear here as the interviewer asks them.
                    </div>
                ) : (
                    questions.map((q, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isDone = q.status === "Answered";

                        return (
                            <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border text-xs transition-all ${
                                    isCurrent
                                        ? "bg-[#F6F6F7] border-[#111111] text-[#111111] shadow-xs"
                                        : isDone
                                        ? "bg-white border-[#ECECEC] text-[#6E6E73]"
                                        : "bg-white border-[#ECECEC] text-[#6E6E73]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                                        {isDone ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : isCurrent ? (
                                            <Circle className="h-3.5 w-3.5 text-black fill-black animate-pulse" />
                                        ) : (
                                            <HelpCircle className="h-3.5 w-3.5 text-[#6E6E73]" />
                                        )}
                                        Q{idx + 1}: {q.type || "Technical"}
                                    </span>
                                    {q.difficulty && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F6F6F7] text-[#6E6E73] border border-[#ECECEC]">
                                            {q.difficulty}
                                        </span>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-[#111111]">{q.question}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});
