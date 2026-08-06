import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidateAIInterviews } from "../../services/aiInterviewAgent.service";
import type { AIInterviewSession } from "../../types/aiInterview";
import {
    Sparkles,
    Calendar,
    Clock,
    Award,
    Play,
    XCircle,
    ChevronRight,
    Search,
    RefreshCw,
} from "lucide-react";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

export const AIInterviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<AIInterviewSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "missed">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const loadInterviews = async () => {
        setLoading(true);
        try {
            const data = await getCandidateAIInterviews();
            setInterviews(data || []);
        } catch (err) {
            console.error("Error loading candidate AI interviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInterviews();
    }, []);

    const upcomingList = interviews.filter((i) => i.status === "Waiting" || i.status === "InProgress");
    const completedList = interviews.filter((i) => i.status === "Completed");
    const missedList = interviews.filter((i) => i.status === "Abandoned" || i.status === "Expired");

    const filtered = interviews.filter((item) => {
        const matchesSearch =
            item.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.job?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "upcoming") return item.status === "Waiting" || item.status === "InProgress";
        if (activeTab === "completed") return item.status === "Completed";
        if (activeTab === "missed") return item.status === "Abandoned" || item.status === "Expired";
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span>AI Video Interview Evaluations</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        AI Interviews
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Join assigned AI interview rooms, check system readiness, and review score reports.
                    </p>
                </div>

                <button
                    onClick={loadInterviews}
                    className="p-2 rounded-xl bg-white border border-[#ECECEC] text-neutral-600 hover:bg-neutral-50 transition shadow-2xs cursor-pointer self-start sm:self-auto"
                    title="Refresh"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                    { label: "Total Invitations", count: interviews.length, color: "text-neutral-900" },
                    { label: "Upcoming / Active", count: upcomingList.length, color: "text-blue-700" },
                    { label: "Completed", count: completedList.length, color: "text-emerald-700" },
                    { label: "Missed / Expired", count: missedList.length, color: "text-neutral-500" },
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search job title or company..."
                        className="w-full pl-9 pr-4 py-1.5 bg-neutral-50 border border-[#ECECEC] rounded-xl text-xs text-neutral-800 outline-none focus:border-neutral-400 transition"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                    {[
                        { id: "all", label: `All (${interviews.length})` },
                        { id: "upcoming", label: `Upcoming (${upcomingList.length})` },
                        { id: "completed", label: `Completed (${completedList.length})` },
                        { id: "missed", label: `Missed (${missedList.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid or Empty */}
            {loading ? (
                <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl">
                    Loading AI interview sessions...
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#ECECEC] space-y-2">
                    <Sparkles className="h-6 w-6 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">No AI Interviews Found</p>
                    <p className="text-[11px] text-neutral-400">
                        When recruiters schedule an AI interview for your application, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((item) => {
                        const isCompleted = item.status === "Completed";
                        const isInProgress = item.status === "InProgress";
                        const isWaiting = item.status === "Waiting";
                        const isMissed = item.status === "Abandoned" || item.status === "Expired";

                        return (
                            <div
                                key={item._id}
                                className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-medium">
                                            {item.type} Round
                                        </span>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-neutral-900 text-sm">
                                            {item.job?.title || "Role Evaluation"}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {item.job?.company || "Recruiting Company"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} className="text-neutral-400" />
                                            {item.config?.duration || 45} Min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} className="text-neutral-400" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {isCompleted && item.report?.overallScore !== undefined && (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                                            <div>
                                                <p className="text-[10px] uppercase font-semibold text-neutral-400">Result</p>
                                                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                                    {item.report.hiringRecommendation}
                                                </p>
                                            </div>
                                            <div className="text-right font-mono">
                                                <p className="text-[10px] uppercase font-semibold text-neutral-400">Score</p>
                                                <p className="text-xl font-bold text-neutral-900">
                                                    {item.report.overallScore}<span className="text-xs font-normal text-neutral-400">/100</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-[#ECECEC]">
                                    {isCompleted ? (
                                        <button
                                            onClick={() => navigate(`/candidate/ai-interviews/${item._id}/report`)}
                                            className="w-full py-2 rounded-xl bg-white border border-[#ECECEC] hover:bg-neutral-50 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                                        >
                                            <Award size={14} className="text-emerald-700" />
                                            <span>View My Report & Scores</span>
                                        </button>
                                    ) : isMissed ? (
                                        <button
                                            disabled
                                            className="w-full py-2 rounded-xl bg-neutral-50 border border-[#ECECEC] text-neutral-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
                                        >
                                            <XCircle size={14} className="text-rose-500" />
                                            <span>Session Expired</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/candidate/ai-interviews/${item._id}/waiting`)}
                                            className="w-full py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                                        >
                                            <Play size={14} className="fill-white" />
                                            <span>Enter Waiting Room</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AIInterviewsPage;
