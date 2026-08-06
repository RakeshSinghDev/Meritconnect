import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    FileText,
    Loader2,
    Mail,
    Phone,
    User,
    Sparkles,
    Briefcase,
    CheckCircle2,
    XCircle,
    Calendar,
} from "lucide-react";

import AIResumeScore from "../../components/ai/AIResumeScore";
import ATSScore from "../../components/ai/ATSScore";
import SkillMatch from "../../components/ai/SkillMatch";
import MissingSkills from "../../components/ai/MissingSkills";
import RecommendationCard from "../../components/ai/RecommendationCard";
import AISummary from "../../components/ai/AISummary";
import ScheduleInterviewModal from "../../components/interview/ScheduleInterviewModal";
import { ScheduleAIInterviewModal as ScheduleAIInterviewAgentModal } from "../../components/interview/ScheduleAIInterviewModal";

import {
    shortlistCandidate,
    rejectCandidate,
} from "../../services/ai.service";

import { getCandidateDetails } from "../../services/recruiter.service";
import type { ResumeAnalysis } from "../../types/ai";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

interface CandidateDetailsData {
    candidate: { name: string; email: string; phone?: string };
    job: { title: string; company: string };
    status: string;
    resume?: { url: string };
    aiAnalysis: ResumeAnalysis;
}

const CandidateDetails = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [openInterviewModal, setOpenInterviewModal] = useState(false);
    const [openAIInterviewModal, setOpenAIInterviewModal] = useState(false);
    const [candidate, setCandidate] = useState<CandidateDetailsData | null>(null);

    const loadCandidate = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCandidateDetails(applicationId as string);
            setCandidate(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load candidate dossier.");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        if (applicationId) {
            void loadCandidate();
        }
    }, [applicationId, loadCandidate]);

    const handleShortlist = async () => {
        try {
            setActionLoading(true);
            await shortlistCandidate(applicationId as string);
            await loadCandidate();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);
            await rejectCandidate(applicationId as string);
            await loadCandidate();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-xs font-medium text-neutral-400">
                <Loader2 size={24} className="animate-spin text-neutral-900 mr-2" />
                <span>Loading candidate evaluation dossier...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
                <h2 className="font-semibold">{error}</h2>
            </div>
        );
    }

    if (!candidate) return null;

    const analysis = candidate.aiAnalysis as ResumeAnalysis;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Navigation & Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Back to Submissions
                </button>
            </div>

            {/* Candidate Header Dossier */}
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white font-semibold text-xl shrink-0">
                            {(candidate.candidate.name || "C").charAt(0)}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                                    {candidate.candidate.name}
                                </h1>
                                <StatusBadge status={candidate.status} />
                            </div>

                            <p className="text-xs font-medium text-neutral-500">
                                {candidate.job.title} &bull; <span className="text-neutral-400">{candidate.job.company}</span>
                            </p>

                            <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-500">
                                <span className="flex items-center gap-1.5">
                                    <Mail size={14} className="text-neutral-400" />
                                    {candidate.candidate.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-neutral-400" />
                                    {candidate.candidate.phone ?? "Not Provided"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Resume Action Buttons */}
                    <div className="flex flex-wrap gap-2.5">
                        {candidate.resume?.url ? (
                            <>
                                <a
                                    href={candidate.resume.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-xl border border-[#ECECEC] bg-white px-4 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition shadow-2xs"
                                >
                                    <FileText size={14} /> View Resume
                                </a>
                                <a
                                    href={candidate.resume.url}
                                    download
                                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-black transition shadow-xs"
                                >
                                    <Download size={14} /> Download PDF
                                </a>
                            </>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">
                                Resume Not Uploaded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recruiter Action Bar */}
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                        Recruiter Evaluation Actions
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                        Transition candidate status or dispatch automated AI Video Interview links.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleShortlist}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 text-xs font-medium transition cursor-pointer disabled:opacity-60"
                    >
                        {actionLoading ? "Updating..." : "Shortlist Candidate"}
                    </button>

                    <button
                        onClick={() => setOpenInterviewModal(true)}
                        className="px-3.5 py-2 rounded-xl border border-[#ECECEC] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition cursor-pointer shadow-2xs"
                    >
                        Schedule Manual Round
                    </button>

                    <button
                        onClick={() => setOpenAIInterviewModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Launch AI Interview Agent
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 text-xs font-medium transition cursor-pointer disabled:opacity-60"
                    >
                        Reject Candidate
                    </button>
                </div>
            </div>

            {/* AI Score Analytics Grid */}
            <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <AIResumeScore score={analysis.overallScore} />
                    <ATSScore score={analysis.atsScore} />
                    <RecommendationCard recommendation={analysis.recommendation} confidence={analysis.overallScore} />
                </div>
                <div className="space-y-6">
                    <SkillMatch skills={analysis.matchedSkills} />
                    <MissingSkills skills={analysis.missingSkills} />
                </div>
            </div>

            {/* AI Executive Summary */}
            <AISummary summary={analysis.summary} strengths={analysis.strengths} improvements={analysis.missingSkills} />

            {/* Experience & Education */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <h2 className="mb-4 text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                        Experience Match Index
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-500">Candidate Verified Experience</span>
                            <span className="font-semibold text-neutral-900">{analysis.experience?.candidate ?? 0} Years</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-500">Requisition Required Experience</span>
                            <span className="font-semibold text-neutral-900">{analysis.experience?.required ?? 0} Years</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <h2 className="mb-4 text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                        Educational Credentials
                    </h2>
                    <div className="rounded-xl bg-neutral-50 p-4 border border-[#ECECEC]">
                        <p className="text-xs font-semibold text-neutral-900">{analysis.education}</p>
                    </div>
                </div>
            </div>

            {/* Projects Score */}
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                        Project Portfolio Assessment
                    </h2>
                    <span className="text-xl font-bold font-mono text-neutral-900">
                        {analysis.projectsScore}/5
                    </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div
                        className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                        style={{ width: `${(analysis.projectsScore ?? 0) * 20}%` }}
                    />
                </div>
            </div>

            <ScheduleInterviewModal
                open={openInterviewModal}
                applicationId={applicationId!}
                onClose={() => setOpenInterviewModal(false)}
                onSuccess={loadCandidate}
            />

            <ScheduleAIInterviewAgentModal
                isOpen={openAIInterviewModal}
                applicationId={applicationId!}
                candidateName={candidate.candidate.name}
                jobTitle={candidate.job.title}
                onClose={() => setOpenAIInterviewModal(false)}
                onSuccess={loadCandidate}
            />
        </div>
    );
};

export default CandidateDetails;
