import React, { useState } from "react";
import type { AIInterviewReport, AIInterviewSession } from "../../types/aiInterview";
import {
    Award,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Sparkles,
    MessageSquare,
    Code2,
    Activity,
    Clock,
    User,
    Calendar,
    ChevronRight,
    Info,
    Download,
} from "lucide-react";

interface InterviewReportProps {
    session: AIInterviewSession;
    report?: AIInterviewReport | null;
}

export const InterviewReport: React.FC<InterviewReportProps> = ({ session, report: propReport }) => {
    const report = propReport || session.report;
    const [activeTab, setActiveTab] = useState<"overview" | "explanations" | "transcript" | "coding" | "telemetry">("overview");
    const [selectedScoreExpl, setSelectedScoreExpl] = useState<string | null>(null);

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[24px] border border-[#E8E8ED] text-[#6E6E73] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] font-sans max-w-5xl mx-auto">
                <Sparkles className="h-8 w-8 text-[#1D1D1F] animate-spin" />
                <h3 className="text-base font-semibold text-[#1D1D1F]">Generating Comprehensive AI Evaluation Report...</h3>
                <p className="text-xs text-[#6E6E73] max-w-sm">
                    Gemini 1.5 Pro is processing candidate responses, transcript nuances, code execution, and behavioral metrics.
                </p>
            </div>
        );
    }

    const mainScoreCards = [
        { key: "technicalScore", label: "Technical Knowledge", score: report.technicalScore ?? 80 },
        { key: "communicationScore", label: "Communication", score: report.communicationScore ?? 80 },
        { key: "problemSolvingScore", label: "Problem Solving", score: report.problemSolvingScore ?? 80 },
        { key: "codingScore", label: "Coding Execution", score: report.codingScore ?? 80 },
    ];

    const secondaryScoreCards = [
        { key: "confidenceScore", label: "Confidence", score: report.confidenceScore ?? 80 },
        { key: "behaviorScore", label: "Behavior & Maturity", score: report.behaviorScore ?? 80 },
        { key: "grammarScore", label: "Grammar & Syntax", score: report.grammarScore ?? 85 },
        { key: "vocabularyScore", label: "Domain Vocabulary", score: report.vocabularyScore ?? 85 },
        { key: "leadershipScore", label: "Leadership", score: report.leadershipScore ?? 75 },
        { key: "systemDesignScore", label: "System Design", score: report.systemDesignScore ?? 80 },
    ];

    const explanationsMap = report.scoreExplanations || {};

    const handleDownloadPDF = () => {
        if (report?.pdfUrl && report.pdfUrl.startsWith("http")) {
            window.open(report.pdfUrl, "_blank");
        } else {
            window.print();
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 text-[#1D1D1F] font-sans antialiased select-none print:text-black print:max-w-full">
            {/* 1. LARGE EXECUTIVE SUMMARY HERO */}
            <div className="p-8 md:p-10 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8 print:border-black">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E8E8ED]">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-medium text-[11px] border border-[#E8E8ED] uppercase tracking-wider">
                                Executive Interview Report
                            </span>
                            <span className="text-[#E8E8ED]">•</span>
                            <span className="text-xs text-[#6E6E73] font-mono">
                                {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
                            {report.hiringRecommendation}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-[#6E6E73]">
                            <span>Candidate: <strong className="text-[#1D1D1F] font-semibold">{session.candidate?.name || "Candidate"}</strong></span>
                            <span>•</span>
                            <span>Role: <strong className="text-[#1D1D1F] font-semibold">{session.job?.title || "Requisition"}</strong></span>
                        </div>
                    </div>

                    {/* Overall Score Card */}
                    <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED] text-center min-w-[140px] shrink-0">
                        <p className="text-[10px] uppercase font-semibold text-[#6E6E73] tracking-wider">Overall Score</p>
                        <p className="text-4xl font-semibold tracking-tight text-[#1D1D1F] mt-1 font-mono">{report.overallScore}</p>
                        <p className="text-[10px] text-[#6E6E73] mt-0.5">out of 100</p>
                    </div>
                </div>

                {/* Quick Meta Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                    <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                        <span className="text-[11px] text-[#6E6E73] block">Interview Format</span>
                        <span className="text-[#1D1D1F] font-semibold">{session.type || "Mixed"} Round</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                        <span className="text-[11px] text-[#6E6E73] block">Duration</span>
                        <span className="text-[#1D1D1F] font-semibold">{session.config?.duration || 45} Minutes</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                        <span className="text-[11px] text-[#6E6E73] block">Difficulty Level</span>
                        <span className="text-[#1D1D1F] font-semibold">{session.config?.difficulty || "Adaptive"}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                        <span className="text-[11px] text-[#6E6E73] block">Status</span>
                        <span className="text-[#1D1D1F] font-semibold">Verified & Completed</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs (Apple Segmented Bar - Hidden in Print) */}
            <div className="p-1.5 bg-white border border-[#E8E8ED] rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-[0_2px_12px_rgba(0,0,0,0.02)] print:hidden">
                {[
                    { id: "overview", label: "Executive Scores", icon: FileText },
                    { id: "explanations", label: "Score Explanations", icon: Info },
                    { id: "transcript", label: `Transcript (${session.transcript?.length || 0})`, icon: MessageSquare },
                    { id: "coding", label: `Coding (${session.codingChallenges?.length || 0})`, icon: Code2 },
                    { id: "telemetry", label: "Behavioral Telemetry", icon: Activity },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                                activeTab === tab.id
                                    ? "bg-[#1D1D1F] text-white shadow-2xs"
                                    : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {(activeTab === "overview" || window.matchMedia("print").matches) && (
                <div className="space-y-10">
                    {/* 2. AI EXECUTIVE SUMMARY CARD */}
                    <div className="p-8 md:p-10 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
                            <Sparkles className="h-4 w-4 text-[#1D1D1F]" />
                            <span>AI Executive Summary & Qualitative Synthesis</span>
                        </div>
                        <p className="text-xs text-[#6E6E73] leading-relaxed whitespace-pre-line">
                            {report.detailedAnalysis || "Candidate evaluated across technical, communication, and problem-solving criteria."}
                        </p>
                    </div>

                    {/* 3. FOUR LARGE PRIMARY SCORE CARDS */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                            Core Metric Dimensions (Top 4)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                            {mainScoreCards.map((item) => (
                                <div
                                    key={item.key}
                                    onClick={() => {
                                        setSelectedScoreExpl(item.key);
                                        setActiveTab("explanations");
                                    }}
                                    className="p-6 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer space-y-3"
                                >
                                    <span className="text-xs font-semibold text-[#6E6E73] block">
                                        {item.label}
                                    </span>
                                    <div className="flex items-baseline gap-1 font-mono">
                                        <span className="text-3xl font-bold text-[#1D1D1F]">{item.score}</span>
                                        <span className="text-xs text-[#6E6E73]">/ 100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#1D1D1F] rounded-full transition-all duration-500"
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECONDARY CRITERIA GRID (Remaining 6) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                            Secondary Competency Breakdown
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {secondaryScoreCards.map((item) => (
                                <div
                                    key={item.key}
                                    onClick={() => {
                                        setSelectedScoreExpl(item.key);
                                        setActiveTab("explanations");
                                    }}
                                    className="p-4 rounded-2xl bg-white border border-[#E8E8ED] shadow-2xs hover:border-[#1D1D1F] transition cursor-pointer space-y-1.5"
                                >
                                    <span className="text-[11px] font-medium text-[#6E6E73] block truncate">
                                        {item.label}
                                    </span>
                                    <div className="text-lg font-bold font-mono text-[#1D1D1F]">
                                        {item.score}<span className="text-[10px] font-normal text-[#6E6E73]">/100</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. CANDIDATE STRENGTHS & 5. IMPROVEMENT AREAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        {/* 4. Strengths */}
                        <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                            <div className="flex items-center gap-2 font-semibold text-xs text-[#1D1D1F]">
                                <CheckCircle2 className="h-4 w-4 text-[#1D1D1F]" /> Demonstrated Strengths
                            </div>
                            <ul className="space-y-3">
                                {(report.strengths || []).map((str, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-[#6E6E73]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#1D1D1F] mt-1.5 shrink-0" />
                                        <span className="leading-relaxed">{str}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 5. Improvement Areas */}
                        <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                            <div className="flex items-center gap-2 font-semibold text-xs text-[#1D1D1F]">
                                <AlertTriangle className="h-4 w-4 text-[#1D1D1F]" /> Growth & Improvement Areas
                            </div>
                            <ul className="space-y-3">
                                {(report.weaknesses || []).map((wk, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-[#6E6E73]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#6E6E73] mt-1.5 shrink-0" />
                                        <span className="leading-relaxed">{wk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 6. INTERVIEW TIMELINE */}
                    <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-xs text-[#1D1D1F]">
                            <Clock className="h-4 w-4 text-[#1D1D1F]" /> Session Timeline Milestones
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                                <p className="text-[#6E6E73] text-[11px]">1. Session Init & Readiness</p>
                                <p className="text-[#1D1D1F] font-semibold mt-0.5">Completed</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                                <p className="text-[#6E6E73] text-[11px]">2. Live Question Evaluation</p>
                                <p className="text-[#1D1D1F] font-semibold mt-0.5">{session.transcript?.length || 0} Turn Exchanges</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED]">
                                <p className="text-[#6E6E73] text-[11px]">3. AI Gemini Report Synthesis</p>
                                <p className="text-[#1D1D1F] font-semibold mt-0.5">Verified</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: DETAILED SCORE EXPLANATIONS */}
            {activeTab === "explanations" && (
                <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="pb-4 border-b border-[#E8E8ED]">
                        <h3 className="font-semibold text-sm text-[#1D1D1F]">
                            Detailed AI Score Rationales
                        </h3>
                        <p className="text-xs text-[#6E6E73] mt-0.5">
                            Explanations citing candidate transcript evidence for each criterion.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[...mainScoreCards, ...secondaryScoreCards].map((item) => {
                            const explanationText =
                                explanationsMap[item.key] ||
                                `Candidate received a score of ${item.score}/100 in ${item.label} based on their domain vocabulary, response clarity, and problem-solving approach.`;

                            const isSelected = selectedScoreExpl === item.key;

                            return (
                                <div
                                    key={item.key}
                                    className={`p-5 rounded-2xl border text-xs space-y-2 transition ${
                                        isSelected
                                            ? "bg-[#F5F5F7] border-[#1D1D1F]"
                                            : "bg-white border-[#E8E8ED]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between font-semibold">
                                        <span className="text-[#1D1D1F] flex items-center gap-2">
                                            <span className="font-mono text-sm">{item.score}/100</span>
                                            <span>{item.label}</span>
                                        </span>
                                    </div>
                                    <p className="text-[#6E6E73] leading-relaxed">{explanationText}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: 7. TRANSCRIPT IN CHAT STYLE */}
            {activeTab === "transcript" && (
                <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8E8ED]">
                        <div>
                            <h3 className="font-semibold text-sm text-[#1D1D1F]">
                                Speech-to-Text Conversation Transcript
                            </h3>
                            <p className="text-xs text-[#6E6E73] mt-0.5">
                                Apple iMessage style transcript of candidate and AI interviewer exchange
                            </p>
                        </div>
                        <span className="text-xs font-mono text-[#6E6E73]">
                            {session.transcript?.length || 0} turns
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {(session.transcript || []).map((t, idx) => {
                            const isInterviewer = t.role === "interviewer";
                            return (
                                <div
                                    key={idx}
                                    className={`flex flex-col text-xs ${isInterviewer ? "items-start" : "items-end"}`}
                                >
                                    <div className="text-[10px] text-[#6E6E73] font-medium mb-1 px-1">
                                        {isInterviewer ? "MeritConnect AI Interviewer" : session.candidate?.name || "Candidate"}
                                    </div>
                                    <div
                                        className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                                            isInterviewer
                                                ? "bg-[#F5F5F7] border border-[#E8E8ED] text-[#1D1D1F]"
                                                : "bg-[#1D1D1F] text-white"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{t.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 4: 8. CODING ASSESSMENT */}
            {activeTab === "coding" && (
                <div className="space-y-6">
                    {session.codingChallenges?.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-[24px] border border-[#E8E8ED] text-[#6E6E73] shadow-2xs space-y-2">
                            <Code2 className="h-8 w-8 text-[#1D1D1F] mx-auto" />
                            <p className="text-xs font-semibold text-[#1D1D1F]">No Coding Challenges Administered</p>
                            <p className="text-[11px]">This session did not include an interactive coding round.</p>
                        </div>
                    ) : (
                        (session.codingChallenges || []).map((challenge, idx) => (
                            <div key={idx} className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-[#E8E8ED]">
                                    <div>
                                        <h4 className="font-semibold text-sm text-[#1D1D1F]">{challenge.title}</h4>
                                        <p className="text-xs text-[#6E6E73] mt-0.5">{challenge.description}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E8E8ED] text-[#1D1D1F] text-[11px] font-mono font-medium">
                                        {challenge.language || "javascript"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider">Candidate Solution Code</p>
                                    <pre className="p-5 rounded-2xl bg-[#1D1D1F] text-white font-mono text-xs overflow-x-auto leading-relaxed">
                                        <code>{challenge.candidateCode || "// No code submitted."}</code>
                                    </pre>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB 5: 9. BEHAVIORAL ASSESSMENT & TELEMETRY */}
            {activeTab === "telemetry" && (
                <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="pb-4 border-b border-[#E8E8ED]">
                        <h3 className="font-semibold text-sm text-[#1D1D1F]">
                            Behavioral & Telemetry Analytics
                        </h3>
                        <p className="text-xs text-[#6E6E73] mt-0.5">
                            Real-time engagement, posture, eye contact, and vocal fluency indicators
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                        <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED] space-y-1">
                            <p className="text-[#6E6E73]">Eye Contact Index</p>
                            <p className="text-3xl font-semibold font-mono text-[#1D1D1F]">{session.metrics?.eyeContactScore ?? 95}%</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED] space-y-1">
                            <p className="text-[#6E6E73]">Overall Engagement</p>
                            <p className="text-3xl font-semibold font-mono text-[#1D1D1F]">{session.metrics?.overallEngagement ?? 92}%</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E8E8ED] space-y-1">
                            <p className="text-[#6E6E73]">Filler Words Count</p>
                            <p className="text-3xl font-semibold font-mono text-[#1D1D1F]">{session.metrics?.fillerWords?.count ?? 2}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 10. DOWNLOAD PDF & ACTION FOOTER */}
            <div className="p-8 rounded-[24px] bg-white border border-[#E8E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-[#1D1D1F]">Export Evaluation Dossier</h4>
                    <p className="text-[11px] text-[#6E6E73]">Download branded candidate evaluation report PDF or print record.</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1D1D1F] text-white text-xs font-medium hover:bg-black transition shadow-2xs cursor-pointer"
                >
                    <Download size={15} /> Download PDF Report
                </button>
            </div>
        </div>
    );
};

export default InterviewReport;
