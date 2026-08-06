import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Plus,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    User,
    Video,
    Sparkles,
    FileText,
    TrendingUp,
    Briefcase,
    Brain,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* CARD PRIMITIVE                                                             */
/* -------------------------------------------------------------------------- */
export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-[28px] bg-white border border-[#ECECEC] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] transition-all duration-300 ${className}`}
    >
        {children}
    </motion.div>
);

/* -------------------------------------------------------------------------- */
/* METRIC CARD PRIMITIVE (KPI)                                                */
/* -------------------------------------------------------------------------- */
export interface MetricCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    trend?: { label: string; positive?: boolean };
    icon?: React.ElementType;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtext,
    trend,
    icon: Icon,
}) => (
    <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25 }}
        className="rounded-[28px] bg-white border border-[#ECECEC] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between space-y-4"
    >
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider">
                {title}
            </span>
            {Icon && <Icon className="h-4 w-4 text-[#111111]" />}
        </div>
        <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-[#111111]">
                {value}
            </div>
            {subtext && (
                <p className="text-xs text-[#6E6E73] font-normal">{subtext}</p>
            )}
        </div>
        {trend && (
            <div className="flex items-center gap-1 text-xs font-medium text-[#111111]">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#111111]" />
                <span>{trend.label}</span>
            </div>
        )}
    </motion.div>
);

/* -------------------------------------------------------------------------- */
/* STATUS BADGE PRIMITIVE (Strict Monochrome)                                 */
/* -------------------------------------------------------------------------- */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#F2F2F7] text-[#111111] border border-[#ECECEC]">
            {status}
        </span>
    );
};

/* -------------------------------------------------------------------------- */
/* SECTION HEADER PRIMITIVE                                                   */
/* -------------------------------------------------------------------------- */
export const SectionHeader: React.FC<{
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
        <div>
            <h2 className="text-lg font-semibold text-[#111111] tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-xs text-[#6E6E73] mt-0.5">{subtitle}</p>
            )}
        </div>
        {action}
    </div>
);

/* -------------------------------------------------------------------------- */
/* HIRING PIPELINE COMPONENT                                                  */
/* -------------------------------------------------------------------------- */
export interface PipelineStage {
    name: string;
    count: number;
    percentage: number;
}

export const HiringPipeline: React.FC<{ stages: PipelineStage[] }> = ({
    stages,
}) => (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-3">
        {stages.map((stage, idx) => (
            <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-3 hover:bg-[#E5E5EA]/40 transition duration-200"
            >
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider">
                    <span>{stage.name}</span>
                    <span className="text-[#111111] font-mono">
                        {stage.percentage}%
                    </span>
                </div>
                <div className="text-2xl font-semibold text-[#111111] tracking-tight">
                    {stage.count}
                </div>
                {/* Monochrome Progress Bar */}
                <div className="w-full h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#111111] rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(100, Math.max(4, stage.percentage))}%`,
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* -------------------------------------------------------------------------- */
/* TODAY'S SCHEDULE COMPONENT                                                 */
/* -------------------------------------------------------------------------- */
export interface ScheduleItem {
    id: string;
    candidateName: string;
    jobTitle: string;
    time: string;
    type: string;
    status: string;
}

export const TodaySchedule: React.FC<{
    items: ScheduleItem[];
    onScheduleNew: () => void;
}> = ({ items, onScheduleNew }) => (
    <div className="space-y-5">
        <SectionHeader
            title="Upcoming & Scheduled Interviews"
            subtitle="Autonomous AI video evaluations queued for today"
            action={
                <button
                    onClick={onScheduleNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#111111] text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> Schedule Session
                </button>
            }
        />

        {items.length === 0 ? (
            <div className="p-10 text-center bg-[#F6F6F7] rounded-2xl border border-dashed border-[#ECECEC] space-y-2">
                <Calendar className="h-6 w-6 text-[#6E6E73] mx-auto" />
                <p className="text-xs font-medium text-[#111111]">
                    No Interviews Scheduled Today
                </p>
                <p className="text-[11px] text-[#6E6E73]">
                    Schedule an AI Video Interview to evaluate candidates autonomously.
                </p>
            </div>
        ) : (
            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] flex items-center justify-between gap-4 hover:bg-[#E5E5EA]/40 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                {item.candidateName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-[#111111]">
                                    {item.candidateName}
                                </h4>
                                <p className="text-[11px] text-[#6E6E73]">
                                    {item.jobTitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="text-[11px] font-mono text-[#6E6E73] flex items-center gap-1 justify-end">
                                    <Clock className="h-3 w-3" /> {item.time}
                                </span>
                                <StatusBadge status={item.status} />
                            </div>

                            <Link
                                to={
                                    item.status === "Completed"
                                        ? `/recruiter/ai-interviews/${item.id}/report`
                                        : `/candidate/ai-interviews/${item.id}/waiting`
                                }
                                className="px-4 py-2 rounded-2xl bg-[#111111] hover:bg-black text-white text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                            >
                                {item.status === "Completed" ? (
                                    <>
                                        <FileText className="h-3.5 w-3.5" /> Report
                                    </>
                                ) : (
                                    <>
                                        <Video className="h-3.5 w-3.5" /> Join Room
                                    </>
                                )}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

/* -------------------------------------------------------------------------- */
/* RECENT ACTIVITY TIMELINE                                                   */
/* -------------------------------------------------------------------------- */
export interface ActivityItem {
    id: string;
    title: string;
    timestamp: string;
    type: "application" | "interview" | "status";
}

export const RecentActivityFeed: React.FC<{ items: ActivityItem[] }> = ({
    items,
}) => (
    <div className="space-y-5">
        <SectionHeader
            title="Activity Feed"
            subtitle="Real-time recruitment stream"
        />
        <div className="space-y-3">
            {items.map((act) => (
                <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] flex items-center justify-between text-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-[#ECECEC] text-[#111111] shadow-2xs">
                            {act.type === "interview" ? (
                                <Sparkles className="h-3.5 w-3.5 text-[#111111]" />
                            ) : act.type === "status" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#111111]" />
                            ) : (
                                <User className="h-3.5 w-3.5 text-[#111111]" />
                            )}
                        </div>
                        <span className="font-medium text-[#111111]">
                            {act.title}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6E6E73] shrink-0">
                        {act.timestamp}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* AI TALENT INSIGHTS CARD                                                    */
/* -------------------------------------------------------------------------- */
export const AIInsightsCard: React.FC<{
    avgATSScore: number;
    totalApplications: number;
    totalJobs: number;
}> = ({ avgATSScore, totalApplications, totalJobs }) => (
    <div className="space-y-5">
        <SectionHeader
            title="AI Talent Insights"
            subtitle="Automated candidate match analytics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#6E6E73] font-medium">
                    <Brain className="h-3.5 w-3.5 text-[#111111]" />
                    <span>Avg ATS Score</span>
                </div>
                <div className="text-2xl font-semibold text-[#111111]">
                    {avgATSScore}%
                </div>
                <p className="text-[11px] text-[#6E6E73]">
                    Based on resume semantic analysis
                </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#6E6E73] font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#111111]" />
                    <span>Qualification Index</span>
                </div>
                <div className="text-2xl font-semibold text-[#111111]">High</div>
                <p className="text-[11px] text-[#6E6E73]">
                    {totalApplications} profiles analyzed
                </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F6F7] border border-[#ECECEC] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#6E6E73] font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-[#111111]" />
                    <span>Active Openings</span>
                </div>
                <div className="text-2xl font-semibold text-[#111111]">
                    {totalJobs} Roles
                </div>
                <p className="text-[11px] text-[#6E6E73]">
                    AI agent interviewing enabled
                </p>
            </div>
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* PREMIUM LOADING SKELETON                                                   */
/* -------------------------------------------------------------------------- */
export const DashboardSkeleton: React.FC = () => (
    <div className="min-h-screen bg-[#F6F6F7] p-8 md:p-12 space-y-10 max-w-[1400px] mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-[#ECECEC]">
            <div className="space-y-2">
                <div className="h-4 w-36 bg-[#E5E5EA] rounded-md" />
                <div className="h-10 w-72 bg-[#E5E5EA] rounded-xl" />
            </div>
            <div className="flex gap-4">
                <div className="h-12 w-44 bg-[#E5E5EA] rounded-2xl" />
                <div className="h-12 w-44 bg-[#E5E5EA] rounded-2xl" />
            </div>
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
            <div className="md:col-span-5 h-44 bg-white border border-[#ECECEC] rounded-[28px] p-8" />
            <div className="md:col-span-4 h-44 bg-white border border-[#ECECEC] rounded-[28px] p-8" />
            <div className="md:col-span-3 h-44 bg-white border border-[#ECECEC] rounded-[28px] p-8" />
        </div>
    </div>
);
