import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAIInterviewSession } from "../../services/aiInterviewAgent.service";
import { getMyJobs } from "../../services/job.service";
import { getJobApplications } from "../../services/recruiter.service";
import type { Job } from "../../types/job";
import {
    Sparkles,
    X,
    User,
    Briefcase,
    Clock,
    Check,
    Code2,
    Layers,
    FileText,
    FolderGit2,
    MessageSquare,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface ScheduleAIInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId?: string;
    candidateName?: string;
    jobTitle?: string;
    onSuccess?: () => void;
}

export const ScheduleAIInterviewModal: React.FC<ScheduleAIInterviewModalProps> = ({
    isOpen,
    onClose,
    applicationId: initialApplicationId,
    candidateName: initialCandidateName,
    jobTitle: initialJobTitle,
    onSuccess,
}) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string>(
        initialApplicationId || ""
    );
    const [loadingData, setLoadingData] = useState<boolean>(false);

    // Form Configuration States
    const [type, setType] = useState<any>("Mixed");
    const [duration, setDuration] = useState(45);
    const [difficulty, setDifficulty] = useState<any>("Adaptive");
    const [questionCount, setQuestionCount] = useState(6);
    const [codingEnabled, setCodingEnabled] = useState(true);
    const [systemDesignEnabled, setSystemDesignEnabled] = useState(false);
    const [resumeDiscussion, setResumeDiscussion] = useState(true);
    const [projectDeepDive, setProjectDeepDive] = useState(true);
    const [communicationEval, setCommunicationEval] = useState(true);
    const [leadershipEval, setLeadershipEval] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    // Fetch recruiter jobs if opening without initial application
    useEffect(() => {
        if (isOpen && !initialApplicationId) {
            setLoadingData(true);
            getMyJobs()
                .then((data) => setJobs(data || []))
                .catch((err) => console.error("Error loading jobs:", err))
                .finally(() => setLoadingData(false));
        }
    }, [isOpen, initialApplicationId]);

    // Fetch applications when a job is selected
    useEffect(() => {
        if (selectedJobId && !initialApplicationId) {
            getJobApplications(selectedJobId)
                .then((data) => setApplications(data || []))
                .catch((err) => console.error("Error loading candidates:", err));
        }
    }, [selectedJobId, initialApplicationId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const targetAppId = initialApplicationId || selectedApplicationId;
        if (!targetAppId) {
            toast.error("Please select a candidate application to schedule.");
            return;
        }

        setSubmitting(true);
        try {
            await createAIInterviewSession({
                applicationId: targetAppId,
                type,
                config: {
                    duration,
                    difficulty,
                    questionCount,
                    codingEnabled,
                    systemDesignEnabled,
                },
            });
            toast.success("Interview session created successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to create interview session"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedAppObject = applications.find(
        (app) => app._id === selectedApplicationId
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 md:p-6 overflow-y-auto font-sans antialiased text-[#111111] select-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-2xl rounded-[32px] bg-white border border-[#ECECEC] p-8 md:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.08)] space-y-8 my-auto"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
                                    ✨ Create Interview Session
                                </span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-xs text-[#6B7280]">
                                    Powered by MeritConnect AI
                                </span>
                            </div>
                            <p className="text-xs text-[#6B7280] font-normal pt-1">
                                Create a fully autonomous AI interview session for a candidate.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[#F7F8FA] text-[#6B7280] hover:text-[#111111] transition-all cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Context / Job & Candidate Selection */}
                        {initialApplicationId ? (
                            /* Fixed Candidate Context */
                            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#ECECEC] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                        {(initialCandidateName || "C").charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            {initialCandidateName}
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280]">
                                            {initialJobTitle}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                    Resume uploaded ✓
                                </span>
                            </div>
                        ) : (
                            /* Searchable Selectors for Job & Candidate */
                            <div className="space-y-5">
                                {/* Section 1: Select Job */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-[#111111]">
                                        Select Job Requisition
                                    </label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(e) => {
                                            setSelectedJobId(e.target.value);
                                            setSelectedApplicationId("");
                                        }}
                                        className="w-full h-[52px] rounded-2xl bg-[#F7F8FA] border border-[#ECECEC] px-4 text-xs text-[#111111] font-medium outline-none focus:border-[#111111] focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="">Choose active job opening...</option>
                                        {jobs.map((job) => (
                                            <option key={job._id} value={job._id}>
                                                {job.title} ({job.company || "Company"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section 2: Candidate */}
                                {selectedJobId && (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-medium text-[#111111]">
                                                Select Candidate Application
                                            </label>
                                            <select
                                                value={selectedApplicationId}
                                                onChange={(e) =>
                                                    setSelectedApplicationId(e.target.value)
                                                }
                                                className="w-full h-[52px] rounded-2xl bg-[#F7F8FA] border border-[#ECECEC] px-4 text-xs text-[#111111] font-medium outline-none focus:border-[#111111] focus:bg-white transition-all cursor-pointer"
                                            >
                                                <option value="">Choose candidate profile...</option>
                                                {applications.map((app) => (
                                                    <option key={app._id} value={app._id}>
                                                        {app.candidate?.name || app.candidateName || "Candidate"} ({app.candidate?.email || app.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Candidate Preview Card */}
                                        {selectedAppObject && (
                                            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#ECECEC] flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                                        {(
                                                            selectedAppObject.candidate?.name ||
                                                            selectedAppObject.candidateName ||
                                                            "C"
                                                        ).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-[#111111]">
                                                            {selectedAppObject.candidate?.name ||
                                                                selectedAppObject.candidateName}
                                                        </h4>
                                                        <p className="text-[11px] text-[#6B7280]">
                                                            {selectedAppObject.candidate?.email ||
                                                                selectedAppObject.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {selectedAppObject.score !== undefined && (
                                                        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                                            ATS {selectedAppObject.score}%
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-medium text-emerald-700">
                                                        Resume uploaded ✓
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section 3: Interview Type (Segmented Controls) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-[#111111]">
                                Interview Format Type
                            </label>
                            <div className="p-1 bg-[#F7F8FA] rounded-2xl border border-[#ECECEC] grid grid-cols-4 gap-1">
                                {["Technical", "Behavioral", "Coding", "Mixed"].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setType(opt)}
                                        className={`py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            type === opt
                                                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                                                : "text-[#6B7280] hover:text-[#111111]"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Interview Duration (Pill Selector) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-[#111111]">
                                Session Duration
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[15, 30, 45, 60, 90].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setDuration(mins)}
                                        className={`px-4 py-2 rounded-2xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                                            duration === mins
                                                ? "bg-[#111111] text-white border-[#111111] font-semibold shadow-2xs"
                                                : "bg-[#F7F8FA] border-[#ECECEC] text-[#6B7280] hover:border-neutral-300 hover:text-[#111111]"
                                        }`}
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 5: Difficulty (Segmented Controls) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-[#111111]">
                                Difficulty Target
                            </label>
                            <div className="p-1 bg-[#F7F8FA] rounded-2xl border border-[#ECECEC] grid grid-cols-5 gap-1">
                                {["Adaptive", "Junior", "Mid", "Senior", "Lead"].map((diff) => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => setDifficulty(diff)}
                                        className={`py-2.5 rounded-xl text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                                            difficulty === diff
                                                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                                                : "text-[#6B7280] hover:text-[#111111]"
                                        }`}
                                    >
                                        {diff === "Adaptive" ? "Adaptive AI" : diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 6: Interview Features (Premium Toggle Cards) */}
                        <div className="space-y-3">
                            <label className="block text-xs font-medium text-[#111111]">
                                Autonomous Assessment Features
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Feature 1: Coding Round */}
                                <div
                                    onClick={() => setCodingEnabled(!codingEnabled)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        codingEnabled
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            codingEnabled
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {codingEnabled && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            Coding Round
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Interactive code editor with syntax highlighting and hidden test cases.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 2: System Design */}
                                <div
                                    onClick={() => setSystemDesignEnabled(!systemDesignEnabled)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        systemDesignEnabled
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            systemDesignEnabled
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {systemDesignEnabled && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            System Design
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Architecture decomposition and scalable system design evaluation.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 3: Resume Discussion */}
                                <div
                                    onClick={() => setResumeDiscussion(!resumeDiscussion)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        resumeDiscussion
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            resumeDiscussion
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {resumeDiscussion && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            Resume Discussion
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Grounded questions targeting uploaded resume experience.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 4: Project Deep Dive */}
                                <div
                                    onClick={() => setProjectDeepDive(!projectDeepDive)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        projectDeepDive
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            projectDeepDive
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {projectDeepDive && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            Project Deep Dive
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Technical verification of key portfolio projects and choices.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 5: Communication Evaluation */}
                                <div
                                    onClick={() => setCommunicationEval(!communicationEval)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        communicationEval
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            communicationEval
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {communicationEval && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            Communication Evaluation
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Real-time speech clarity, vocabulary, and poise analysis.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 6: Leadership Assessment */}
                                <div
                                    onClick={() => setLeadershipEval(!leadershipEval)}
                                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3 ${
                                        leadershipEval
                                            ? "border-[#111111] shadow-2xs bg-[#F7F8FA]/60"
                                            : "border-[#ECECEC] hover:border-neutral-300"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                            leadershipEval
                                                ? "bg-[#111111] border-[#111111] text-white"
                                                : "border-[#ECECEC] bg-[#F7F8FA]"
                                        }`}
                                    >
                                        {leadershipEval && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#111111]">
                                            Leadership Assessment
                                        </h4>
                                        <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                            Behavioral situation handling and team collaboration assessment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-3 rounded-2xl border border-[#ECECEC] text-[#111111] hover:bg-[#F7F8FA] text-xs font-medium transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-3 rounded-2xl bg-[#111111] text-white hover:bg-black text-xs font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? "Creating Session..." : "Create Interview Session"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
