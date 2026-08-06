import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getRecruiterAIInterviews,
    cancelAIInterviewSession,
    updateAIInterviewSession,
} from "../../services/aiInterviewAgent.service";
import type { AIInterviewSession } from "../../types/aiInterview";
import { ScheduleAIInterviewModal } from "../../components/interview/ScheduleAIInterviewModal";
import {
    Sparkles,
    Award,
    Search,
    Plus,
    XCircle,
    Clock,
    User,
    Briefcase,
    Activity,
    Sliders,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

const RecruiterAIInterviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<AIInterviewSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // Modal States
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [rescheduleSession, setRescheduleSession] = useState<AIInterviewSession | null>(null);

    // Reschedule form states
    const [editType, setEditType] = useState<any>("Mixed");
    const [editDifficulty, setEditDifficulty] = useState<any>("Adaptive");
    const [editDuration, setEditDuration] = useState(45);
    const [updating, setUpdating] = useState(false);

    const loadInterviews = async () => {
        setLoading(true);
        try {
            const data = await getRecruiterAIInterviews();
            setInterviews(data || []);
        } catch (err) {
            console.error("Failed to load recruiter interviews:", err);
            toast.error("Failed to load AI interviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInterviews();
    }, []);

    const handleCancel = async (id: string, candidateName?: string) => {
        if (!window.confirm(`Are you sure you want to cancel the AI interview for ${candidateName || "this candidate"}?`)) {
            return;
        }

        try {
            await cancelAIInterviewSession(id);
            toast.success("AI Interview session cancelled.");
            loadInterviews();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to cancel interview");
        }
    };

    const handleOpenReschedule = (item: AIInterviewSession) => {
        setRescheduleSession(item);
        setEditType(item.type || "Mixed");
        setEditDifficulty(item.config?.difficulty || "Adaptive");
        setEditDuration(item.config?.duration || 45);
    };

    const handleSaveReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleSession) return;

        setUpdating(true);
        try {
            await updateAIInterviewSession(rescheduleSession._id, {
                type: editType,
                config: {
                    difficulty: editDifficulty,
                    duration: editDuration,
                },
            });
            toast.success("Interview session updated!");
            setRescheduleSession(null);
            loadInterviews();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update interview");
        } finally {
            setUpdating(false);
        }
    };

    const filtered = interviews.filter((item) => {
        const matchesSearch =
            item.candidate?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.job?.title?.toLowerCase().includes(filterText.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: interviews.length,
        completed: interviews.filter((i) => i.status === "Completed").length,
        inProgress: interviews.filter((i) => i.status === "InProgress").length,
        waiting: interviews.filter((i) => i.status === "Waiting").length,
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-neutral-900 font-sans antialiased">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span>Autonomous AI Interview Module</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        AI Video Interviews
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Schedule, configure, and inspect candidate video evaluation reports.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadInterviews}
                        className="p-2 rounded-xl bg-white border border-[#ECECEC] text-neutral-600 hover:bg-neutral-50 transition shadow-2xs cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Schedule AI Interview
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                    { label: "Total Sessions", count: stats.total, color: "text-neutral-900" },
                    { label: "Completed", count: stats.completed, color: "text-emerald-700" },
                    { label: "In Progress", count: stats.inProgress, color: "text-amber-700" },
                    { label: "Awaiting Candidate", count: stats.waiting, color: "text-blue-700" },
                ].map((st, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{st.label}</p>
                        <p className={`text-2xl font-semibold tracking-tight mt-1 ${st.color}`}>{st.count}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="relative w-full sm:w-72">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                        type="text"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="Search candidate or role..."
                        className="w-full pl-9 pr-4 py-1.5 bg-neutral-50 border border-[#ECECEC] rounded-xl text-xs text-neutral-800 outline-none focus:border-neutral-400 transition"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                    {["All", "Waiting", "InProgress", "Completed", "Abandoned"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                                statusFilter === st
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                        >
                            {st === "InProgress" ? "In Progress" : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interviews Grid */}
            {loading ? (
                <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl">
                    Loading AI interview sessions...
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#ECECEC] space-y-2">
                    <Sparkles className="h-6 w-6 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">No AI Interviews Found</p>
                    <p className="text-[11px] text-neutral-400">
                        Schedule an AI interview to begin evaluating candidate responses.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((item) => {
                        const isCompleted = item.status === "Completed";
                        const isInProgress = item.status === "InProgress";
                        const isWaiting = item.status === "Waiting";
                        const isAbandoned = item.status === "Abandoned";

                        return (
                            <div
                                key={item._id}
                                className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-medium">
                                                {item.type}
                                            </span>
                                            <span className="text-[11px] text-neutral-400 font-mono">
                                                {item.config?.duration || 45} min
                                            </span>
                                        </div>

                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-neutral-900 text-sm">
                                            {item.candidate?.name || "Candidate"}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Role: <span className="font-medium text-neutral-800">{item.job?.title || "Position"}</span>
                                        </p>
                                    </div>

                                    {isCompleted && item.report?.overallScore !== undefined ? (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-neutral-400">Recommendation</p>
                                                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                                    {item.report.hiringRecommendation}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-semibold text-neutral-400">Overall Score</p>
                                                <p className="text-xl font-bold font-mono text-neutral-900">
                                                    {item.report.overallScore}<span className="text-xs font-normal text-neutral-400">/100</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl bg-neutral-50 border border-[#ECECEC] text-xs text-neutral-500">
                                            <p className="text-[11px]">
                                                {isInProgress
                                                    ? "Live video interview in progress..."
                                                    : "Session generated. Awaiting candidate entry."}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-[#ECECEC] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {(isWaiting || isAbandoned) && (
                                            <button
                                                onClick={() => handleOpenReschedule(item)}
                                                className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                                                title="Reschedule Session"
                                            >
                                                <Sliders className="h-3.5 w-3.5" />
                                            </button>
                                        )}

                                        {isWaiting && (
                                            <button
                                                onClick={() => handleCancel(item._id, item.candidate?.name)}
                                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                                title="Cancel Session"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/recruiter/ai-interviews/${item._id}/report`)}
                                        className="py-1.5 px-3 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium flex items-center gap-1 transition shadow-xs cursor-pointer ml-auto"
                                    >
                                        <Award className="h-3.5 w-3.5" />
                                        <span>{isCompleted ? "View Report" : "Details"}</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ScheduleAIInterviewModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onSuccess={loadInterviews}
            />

            {/* Reschedule Modal */}
            {rescheduleSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-[#ECECEC] p-6 shadow-2xl space-y-4 text-neutral-900">
                        <div className="flex items-center justify-between pb-3 border-b border-[#ECECEC]">
                            <h3 className="font-semibold text-sm">Reschedule AI Interview</h3>
                            <button onClick={() => setRescheduleSession(null)} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveReschedule} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-neutral-500 font-medium mb-1">Format</label>
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value)}
                                    className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-800 outline-none"
                                >
                                    <option value="Mixed">Mixed</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Behavioral">Behavioral</option>
                                    <option value="Coding">Coding</option>
                                    <option value="SystemDesign">System Design</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-500 font-medium mb-1">Difficulty</label>
                                    <select
                                        value={editDifficulty}
                                        onChange={(e) => setEditDifficulty(e.target.value)}
                                        className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-800 outline-none"
                                    >
                                        <option value="Adaptive">Adaptive</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-neutral-500 font-medium mb-1">Duration (Min)</label>
                                    <input
                                        type="number"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(Number(e.target.value))}
                                        className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-800 outline-none"
                                        min={15}
                                        max={90}
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#ECECEC]">
                                <button
                                    type="button"
                                    onClick={() => setRescheduleSession(null)}
                                    className="px-3.5 py-1.5 rounded-xl border border-[#ECECEC] text-neutral-700 font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white font-medium shadow-xs cursor-pointer"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterAIInterviewsPage;