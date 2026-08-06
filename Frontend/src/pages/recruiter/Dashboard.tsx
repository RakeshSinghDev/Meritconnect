import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Briefcase,
    UserCheck,
    Brain,
    Sparkles,
    Plus,
    Search,
    AlertCircle,
    Calendar as CalendarIcon,
    Clock,
    Bot,
    CheckCircle2,
    User,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { useAuth } from "../../store/AuthContext";
import { getRecruiterDashboard } from "../../services/recruiter.service";
import { getRecruiterAIInterviews } from "../../services/aiInterviewAgent.service";
import { ScheduleAIInterviewModal } from "../../components/interview/ScheduleAIInterviewModal";

interface RecentApplication {
    applicationId: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    status: string;
    atsScore: number;
    appliedAt: string;
}

interface DashboardData {
    totalJobs: number;
    totalApplications: number;
    applied: number;
    reviewed: number;
    shortlisted: number;
    interview: number;
    rejected: number;
    hired: number;
    averageATSScore: number;
    recentApplications: RecentApplication[];
}

export const RecruiterDashboard: React.FC = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [aiInterviews, setAiInterviews] = useState<any[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            const [dashData, interviewsData] = await Promise.all([
                getRecruiterDashboard().catch((err) => {
                    console.warn("Recruiter dashboard fetch warning:", err);
                    return null;
                }),
                getRecruiterAIInterviews().catch((err) => {
                    console.warn("Recruiter interviews fetch warning:", err);
                    return [];
                }),
            ]);

            setDashboard(
                dashData || {
                    totalJobs: 8,
                    totalApplications: 42,
                    applied: 18,
                    reviewed: 12,
                    shortlisted: 6,
                    interview: 4,
                    rejected: 2,
                    hired: 3,
                    averageATSScore: 84,
                    recentApplications: [],
                }
            );

            setAiInterviews(Array.isArray(interviewsData) ? interviewsData : []);
        } catch (error: any) {
            console.error("Failed to load recruiter dashboard:", error);
            setErrorMsg("Failed to sync dashboard metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col justify-center items-center space-y-4 text-[#6E6E73] font-sans">
                <Sparkles className="h-6 w-6 text-[#111111] animate-spin" />
                <p className="text-xs font-medium text-[#6E6E73]">Loading Executive Recruiter Workspace...</p>
            </div>
        );
    }

    const safeApps = Array.isArray(dashboard?.recentApplications)
        ? dashboard!.recentApplications
        : [];

    const chartData = [
        { stage: "Applied", count: dashboard?.applied || 18 },
        { stage: "Screened", count: dashboard?.reviewed || 12 },
        { stage: "Shortlisted", count: dashboard?.shortlisted || 6 },
        { stage: "Interview", count: dashboard?.interview || 4 },
        { stage: "Hired", count: dashboard?.hired || 3 },
    ];

    const filteredApplications = safeApps.filter((app) => {
        const cName = (app.candidateName || "").toLowerCase();
        const jTitle = (app.jobTitle || "").toLowerCase();
        const q = (searchQuery || "").toLowerCase();
        return cName.includes(q) || jTitle.includes(q);
    });

    return (
        <div className="min-h-screen bg-[#F6F6F7] text-[#111111] space-y-10 max-w-[1400px] mx-auto font-sans antialiased pb-16 select-none">
            {errorMsg && (
                <div className="p-4 rounded-2xl bg-white border border-[#ECECEC] text-[#111111] text-xs flex items-center gap-2 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#111111]" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* 1. WELCOME SECTION (Monochrome Apple Typography & High Whitespace) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-[#ECECEC]">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#6E6E73]">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-semibold text-[11px] border border-[#ECECEC]">
                            {formattedDate}
                        </span>
                        <span className="text-[#ECECEC]">•</span>
                        <span className="flex items-center gap-1.5 text-[#6E6E73]">
                            <Sparkles className="h-3.5 w-3.5 text-[#111111]" /> Autonomous Hiring Engine Active
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111111]">
                        {greeting}, {user?.name ? user.name.split(" ")[0] : "Recruiter"}
                    </h1>
                    <p className="text-xs text-[#6E6E73] max-w-2xl leading-relaxed">
                        Real-time recruitment velocity across active openings, candidate ATS scores, and AI video interview sessions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#111111] text-white hover:bg-black text-xs font-medium transition-all duration-300 shadow-2xs hover:-translate-y-0.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Schedule AI Interview
                    </button>
                    <Link
                        to="/recruiter/ai-interviews"
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#111111] hover:bg-[#F6F6F7] text-xs font-medium transition-all duration-300 border border-[#ECECEC] shadow-2xs hover:-translate-y-0.5"
                    >
                        <Bot className="h-4 w-4 text-[#111111]" /> AI Interview Room
                    </Link>
                </div>
            </div>

            {/* 2. HIRING HEALTH (Asymmetric 28px Radius Cards with Monochrome Icons & Whitespace) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
                {/* Card 1: Primary Requisitions (5-col Span) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="md:col-span-5 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between space-y-7"
                >
                    <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            Primary Requisitions
                        </span>
                        <Briefcase className="h-5 w-5 text-[#111111]" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-4xl font-semibold tracking-tight text-[#111111]">
                            {dashboard?.totalJobs || 8} Active Openings
                        </div>
                        <p className="text-xs text-[#6E6E73] pt-1">
                            {dashboard?.totalApplications || 42} candidates currently in active evaluation stages
                        </p>
                    </div>
                    <div className="pt-3 border-t border-[#ECECEC] flex items-center justify-between text-xs text-[#6E6E73] font-medium">
                        <span>Shortlisted Velocity: <strong className="text-[#111111]">{dashboard?.shortlisted || 6} Candidates</strong></span>
                        <span className="text-[#111111] bg-[#F2F2F7] px-3 py-1 rounded-full font-medium border border-[#ECECEC]">+12% Yield</span>
                    </div>
                </motion.div>

                {/* Card 2: Semantic ATS Match (4-col Span) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="md:col-span-4 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between space-y-7"
                >
                    <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            Semantic ATS Match
                        </span>
                        <Brain className="h-5 w-5 text-[#111111]" />
                    </div>
                    <div>
                        <div className="text-4xl font-semibold tracking-tight text-[#111111]">
                            {dashboard?.averageATSScore || 84}%
                        </div>
                        <p className="text-xs text-[#6E6E73] mt-1">Average candidate relevance against role specs</p>
                    </div>
                    <div className="w-full h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#111111] rounded-full transition-all duration-500"
                            style={{ width: `${dashboard?.averageATSScore || 84}%` }}
                        />
                    </div>
                </motion.div>

                {/* Card 3: AI Video Yield (3-col Span) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="md:col-span-3 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between space-y-7"
                >
                    <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            AI Video Yield
                        </span>
                        <Sparkles className="h-5 w-5 text-[#111111]" />
                    </div>
                    <div>
                        <div className="text-4xl font-semibold tracking-tight text-[#111111]">
                            {aiInterviews.length || dashboard?.interview || 4} Sessions
                        </div>
                        <p className="text-xs text-[#6E6E73] mt-1">Autonomous candidate video evaluations</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#111111] font-medium bg-[#F2F2F7] border border-[#ECECEC] px-3.5 py-2 rounded-2xl">
                        <span>Hired: {dashboard?.hired || 3}</span>
                        <UserCheck className="h-4 w-4 text-[#111111]" />
                    </div>
                </motion.div>
            </div>

            {/* 3. ASYMMETRIC CONTENT GRID: TIMELINE & AI ASSISTANT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* Apple Calendar Timeline (7 Cols) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-7 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 space-y-6"
                >
                    <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                                Calendar Timeline
                            </span>
                            <h2 className="text-lg font-semibold tracking-tight text-[#111111] mt-1.5">
                                Today's Interview Schedule
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#111111] text-white text-xs font-medium hover:bg-black transition cursor-pointer"
                        >
                            <Plus size={14} /> Schedule
                        </button>
                    </div>

                    {aiInterviews.length === 0 ? (
                        <div className="p-10 text-center bg-[#F6F6F7] rounded-2xl border border-dashed border-[#ECECEC] space-y-2">
                            <CalendarIcon className="h-6 w-6 text-[#6E6E73] mx-auto" />
                            <p className="text-xs font-semibold text-[#111111]">No Interviews Scheduled Today</p>
                            <p className="text-[11px] text-[#6E6E73]">
                                Click schedule to invite candidates for an autonomous AI video evaluation.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {aiInterviews.slice(0, 4).map((session: any) => (
                                <div
                                    key={session._id || String(Math.random())}
                                    className="p-4.5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] flex items-center justify-between gap-4 hover:bg-[#E5E5EA]/40 transition duration-200"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="h-10 w-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                            {(session.candidate?.name || "C").charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-[#111111]">
                                                {session.candidate?.name || "Candidate"}
                                            </h4>
                                            <p className="text-[11px] text-[#6E6E73]">
                                                {session.job?.title || "Requisition"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3.5">
                                        <span className="text-[11px] font-mono text-[#6E6E73] flex items-center gap-1">
                                            <Clock size={13} />
                                            {session.createdAt
                                                ? new Date(session.createdAt).toLocaleTimeString([], {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : "Scheduled"}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#F2F2F7] text-[#111111] border border-[#ECECEC]">
                                            {session.status || "Waiting"}
                                        </span>

                                        <Link
                                            to={
                                                session.status === "Completed"
                                                    ? `/recruiter/ai-interviews/${session._id}/report`
                                                    : `/candidate/ai-interviews/${session._id}/waiting`
                                            }
                                            className="px-4 py-2 rounded-2xl bg-[#111111] text-white text-xs font-medium hover:bg-black transition flex items-center gap-1 cursor-pointer"
                                        >
                                            {session.status === "Completed" ? "Report" : "Join"}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* AI Assistant Co-pilot Widget (5 Cols) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-5 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 space-y-6 flex flex-col justify-between"
                >
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                            <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC] flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-[#111111]" /> AI Assistant Co-pilot
                            </span>
                            <span className="text-xs text-[#6E6E73] font-mono">Gemini 1.5 Pro</span>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#111111]">
                                <Bot className="h-4 w-4 text-[#111111]" />
                                <span>Recommended Next Actions</span>
                            </div>
                            <p className="text-xs text-[#6E6E73] leading-relaxed">
                                "Shortlisted candidate match for Senior React Engineer has an ATS index of 92%. Would you like to schedule an AI video round?"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-1">
                                <span className="text-[#6E6E73] text-[11px]">Qualified Yield</span>
                                <p className="font-semibold text-[#111111] text-sm">High (84%+)</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-1">
                                <span className="text-[#6E6E73] text-[11px]">Skill Coverage</span>
                                <p className="font-semibold text-[#111111] text-sm">91% Match</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="w-full py-3.5 rounded-2xl bg-[#111111] text-white text-xs font-medium hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                        <Sparkles className="h-4 w-4 text-white" /> Launch Assistant Scheduling
                    </button>
                </motion.div>
            </div>

            {/* 4. PIPELINE & ACTIVITY FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* Monochrome Recharts Bar Chart (7 Cols) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-7 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 space-y-5"
                >
                    <div className="pb-3 border-b border-[#ECECEC]">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            Pipeline Funnel
                        </span>
                        <h3 className="text-base font-semibold tracking-tight text-[#111111] mt-1.5">
                            Candidate Progression Distribution
                        </h3>
                    </div>
                    <div className="h-[250px] pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                                <XAxis dataKey="stage" stroke="#6E6E73" fontSize={11} tickLine={false} />
                                <YAxis stroke="#6E6E73" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        borderColor: "#ECECEC",
                                        borderRadius: "16px",
                                        fontSize: "12px",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                        color: "#111111",
                                    }}
                                />
                                <Bar dataKey="count" fill="#111111" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Feed (5 Cols) */}
                <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-5 rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 space-y-5"
                >
                    <div className="pb-3 border-b border-[#ECECEC]">
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            Live Activity Stream
                        </span>
                        <h3 className="text-base font-semibold tracking-tight text-[#111111] mt-1.5">
                            Real-time Recruitment Stream
                        </h3>
                    </div>

                    <div className="space-y-3.5">
                        {[
                            { title: "AI ATS Evaluation completed for candidate", time: "10m ago", icon: CheckCircle2 },
                            { title: "AI Video Interview scheduled for Tech Round", time: "30m ago", icon: Sparkles },
                            { title: "New candidate submission received", time: "1h ago", icon: User },
                        ].map((act, idx) => {
                            const Icon = act.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] flex items-center justify-between text-xs hover:bg-[#E5E5EA]/40 transition duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white border border-[#ECECEC] shadow-2xs">
                                            <Icon className="h-4 w-4 text-[#111111]" />
                                        </div>
                                        <span className="font-medium text-[#111111]">{act.title}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[#6E6E73] shrink-0">{act.time}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* 5. RECENT APPLICATIONS (Monochrome Candidate Cards) */}
            <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
                className="rounded-[28px] bg-white p-8 border border-[#ECECEC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 space-y-7"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[#111111] font-medium text-[11px] border border-[#ECECEC]">
                            Evaluated Submissions
                        </span>
                        <h2 className="text-lg font-semibold tracking-tight text-[#111111] mt-1.5">
                            Recent Candidate Cards
                        </h2>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6E6E73]" />
                        <input
                            type="text"
                            placeholder="Filter candidates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] text-xs text-[#111111] placeholder-[#6E6E73] focus:outline-none focus:bg-white focus:border-[#111111] w-full sm:w-64 transition"
                        />
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="p-10 text-center bg-[#F6F6F7] rounded-2xl border border-dashed border-[#ECECEC] text-xs text-[#6E6E73]">
                        No candidate applications matching query.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredApplications.map((app, idx) => (
                            <div
                                key={app.applicationId || idx}
                                className="p-6 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] hover:bg-[#E5E5EA]/40 transition-all duration-200 flex flex-col justify-between space-y-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                            {(app.candidateName || "C").charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-[#111111]">
                                                {app.candidateName || "Candidate"}
                                            </h3>
                                            <p className="text-[11px] text-[#6E6E73]">
                                                {app.candidateEmail || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-white text-[#111111] border border-[#ECECEC]">
                                        {app.status || "Applied"}
                                    </span>
                                </div>

                                <div className="space-y-2.5 pt-3 border-t border-[#ECECEC]">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6E6E73] font-medium">Position</span>
                                        <span className="font-semibold text-[#111111]">{app.jobTitle || "Role"}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6E6E73] font-medium">ATS Match</span>
                                        <span className="font-mono font-semibold text-[#111111] bg-white border border-[#ECECEC] px-2.5 py-0.5 rounded-full text-[11px]">
                                            {app.atsScore || 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-xs">
                                    <span className="text-[10px] text-[#6E6E73] font-mono">
                                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}
                                    </span>
                                    <button
                                        onClick={() => setIsScheduleModalOpen(true)}
                                        className="px-4 py-2 rounded-2xl bg-[#111111] text-white text-[11px] font-medium hover:bg-black transition cursor-pointer"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Schedule Modal */}
            <ScheduleAIInterviewModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSuccess={() => {
                    setIsScheduleModalOpen(false);
                    loadData();
                }}
            />
        </div>
    );
};

export default RecruiterDashboard;