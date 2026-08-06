import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    FileText,
    Trophy,
    Brain,
    Calendar,
    Clock,
    Video,
    MapPin,
    Sparkles,
    ArrowUpRight,
    Search,
    ChevronRight,
} from "lucide-react";

import { useAuth } from "../../store/AuthContext";
import { getCandidateInterviews } from "../../services/interview.service";
import type { Interview } from "../../types/interview";
import { getCandidateDashboard } from "../../services/candidate.service";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

interface RecentApplication {
    applicationId: string;
    jobTitle: string;
    company: string;
    status: string;
    atsScore: number;
}

interface CandidateDashboardData {
    totalApplications: number;
    interview: number;
    hired: number;
    averageATSScore: number;
    recentApplications: RecentApplication[];
}

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState<CandidateDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [dashboardData, interviewData] = await Promise.all([
                    getCandidateDashboard().catch(() => null),
                    getCandidateInterviews().catch(() => []),
                ]);

                setDashboard(
                    dashboardData || {
                        totalApplications: 0,
                        interview: 0,
                        hired: 0,
                        averageATSScore: 0,
                        recentApplications: [],
                    }
                );

                setInterviews(Array.isArray(interviewData) ? interviewData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Loading candidate overview...
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-500 bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Unable to load candidate portal metrics.
            </div>
        );
    }

    const cards = [
        {
            title: "Total Applications",
            value: dashboard.totalApplications,
            subtext: "Submitted applications",
            icon: FileText,
        },
        {
            title: "Active Interviews",
            value: dashboard.interview,
            subtext: "Scheduled rounds",
            icon: BriefcaseBusiness,
        },
        {
            title: "Offers Received",
            value: dashboard.hired,
            subtext: "Successful matches",
            icon: Trophy,
        },
        {
            title: "Avg ATS Match",
            value: `${dashboard.averageATSScore}%`,
            subtext: "Resume match index",
            icon: Brain,
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                        <span>Candidate Portal</span>
                        <span className="text-neutral-300">•</span>
                        <span>Career Overview</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        {greeting}, {user?.name ? user.name.split(" ")[0] : "Candidate"}
                    </h1>
                    <p className="text-xs text-neutral-500">
                        Track application statuses, view resume ATS scores, and launch AI interview sessions.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/candidate/jobs"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer"
                    >
                        <Search size={15} /> Explore Job Openings
                    </Link>
                    <Link
                        to="/candidate/ai-interviews"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#ECECEC] hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition shadow-2xs"
                    >
                        <Sparkles size={15} className="text-blue-600" /> AI Interview Room
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="p-5 rounded-2xl bg-white border border-[#ECECEC] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                    {card.title}
                                </span>
                                <Icon className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div>
                                <div className="text-3xl font-semibold tracking-tight text-neutral-900">
                                    {card.value}
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5">{card.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Applications Section */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#ECECEC]">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                            Recent Applications
                        </h2>
                        <p className="text-xs text-neutral-500">Live feedback on your submitted applications</p>
                    </div>
                    <Link
                        to="/candidate/applications"
                        className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
                    >
                        View All <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {dashboard.recentApplications.length === 0 ? (
                    <div className="p-8 text-center bg-neutral-50/50 rounded-xl border border-dashed border-[#ECECEC] space-y-2">
                        <FileText className="h-6 w-6 text-neutral-300 mx-auto" />
                        <p className="text-xs font-medium text-neutral-700">No Applications Submitted</p>
                        <p className="text-[11px] text-neutral-400">
                            Apply to active open positions to get instant AI ATS match evaluations.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {dashboard.recentApplications.map((item) => (
                            <div
                                key={item.applicationId}
                                className="p-3.5 rounded-xl bg-neutral-50/60 border border-[#ECECEC] flex items-center justify-between gap-4 hover:border-neutral-300 transition"
                            >
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold text-xs text-neutral-900">
                                        {item.jobTitle}
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">{item.company}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                        ATS {item.atsScore}%
                                    </span>
                                    <StatusBadge status={item.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Interviews Section */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <div className="pb-3 border-b border-[#ECECEC]">
                    <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                        Scheduled Interview Rounds
                    </h2>
                    <p className="text-xs text-neutral-500">Upcoming recruiter and AI video assessments</p>
                </div>

                {interviews.length === 0 ? (
                    <div className="p-8 text-center bg-neutral-50/50 rounded-xl border border-dashed border-[#ECECEC] space-y-2">
                        <Calendar className="h-6 w-6 text-neutral-300 mx-auto" />
                        <p className="text-xs font-medium text-neutral-700">No Upcoming Interviews</p>
                        <p className="text-[11px] text-neutral-400">
                            When recruiters invite you or schedule an AI interview, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {interviews
                            .filter((i) => i.status === "Scheduled")
                            .map((interview) => (
                                <div
                                    key={interview._id}
                                    className="p-4 rounded-xl bg-neutral-50/60 border border-[#ECECEC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-semibold text-neutral-900">
                                            {interview.job.title}
                                        </h3>
                                        <p className="text-[11px] text-neutral-500">{interview.job.company}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1 font-mono">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={13} />
                                                {new Date(interview.interviewDate).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} />
                                                {new Date(interview.interviewDate).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {interview.mode === "Online" ? (
                                            <a
                                                href={interview.meetingLink ?? "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-medium transition hover:bg-black shadow-xs"
                                            >
                                                <Video size={14} /> Join Meeting
                                            </a>
                                        ) : (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[#ECECEC] text-xs text-neutral-700">
                                                <MapPin size={14} /> {interview.venue}
                                            </span>
                                        )}
                                        <StatusBadge status={interview.status} />
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
