import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    ExternalLink,
    FileText,
    User,
    Loader2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Briefcase,
    GraduationCap,
    Code,
} from "lucide-react";
import { getApplicationResume, type ApplicationResumeResponse } from "../../services/application.service";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

export const ResumeViewerPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ApplicationResumeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        if (!applicationId) return;

        setLoading(true);
        getApplicationResume(applicationId)
            .then((res) => {
                console.log("[ResumeViewer] Fetched application resume data:", res);
                setData(res);
            })
            .catch((err) => {
                console.error("[ResumeViewer] API Error:", err);
                setError("Failed to load original candidate resume.");
            })
            .finally(() => setLoading(false));
    }, [applicationId]);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 175));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
    const handleFitWidth = () => setZoom(100);

    if (loading) {
        return (
            <div className="flex h-[75vh] flex-col items-center justify-center space-y-3 text-neutral-400 font-sans">
                <Loader2 className="h-7 w-7 animate-spin text-neutral-900" />
                <p className="text-xs font-medium text-neutral-500">Loading Candidate Resume Document...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-3 font-sans">
                <p>{error || "Resume record not found."}</p>
                <button
                    onClick={() => navigate("/recruiter/applications")}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-black transition cursor-pointer"
                >
                    Back to Applications
                </button>
            </div>
        );
    }

    const rawResumeUrl = data.resumeUrl || "";
    const isDocx = rawResumeUrl.toLowerCase().endsWith(".docx") || rawResumeUrl.toLowerCase().endsWith(".doc");

    const apiBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");
    const backendServerOrigin = apiBase.replace(/\/api\/v1\/?$/, "");

    // 1. Direct external/local URL resolution
    let absoluteDirectUrl = "";
    if (rawResumeUrl.startsWith("http://") || rawResumeUrl.startsWith("https://")) {
        if (rawResumeUrl.includes("cloudinary.com") && !rawResumeUrl.includes("/fl_inline/")) {
            absoluteDirectUrl = rawResumeUrl.replace("/upload/", "/upload/fl_inline/");
        } else {
            absoluteDirectUrl = rawResumeUrl;
        }
    } else if (rawResumeUrl) {
        const cleanPath = rawResumeUrl.startsWith("/") ? rawResumeUrl : `/${rawResumeUrl}`;
        absoluteDirectUrl = `${backendServerOrigin}${cleanPath}`;
    }

    // 2. Stream URL hitting Express Backend directly (port 5000)
    const backendStreamUrl = `${apiBase}/applications/${applicationId}/resume-file`;

    // 3. Final document viewer URL passed to iframe/object
    const viewerUrl = isDocx
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteDirectUrl || backendStreamUrl)}&embedded=true`
        : backendStreamUrl;

    console.log("[ResumeViewer] rawResumeUrl:", rawResumeUrl);
    console.log("[ResumeViewer] absoluteDirectUrl:", absoluteDirectUrl);
    console.log("[ResumeViewer] backendStreamUrl:", backendStreamUrl);
    console.log("[ResumeViewer] final viewerUrl:", viewerUrl);

    const candidateName = data.candidateName || data.candidate?.name || "Candidate";
    const email = data.email || data.candidate?.email || "N/A";
    const jobTitle = data.jobTitle || data.job?.title || "Applied Role";
    const status = data.status || "Applied";
    const atsScore = data.atsScore ?? data.aiAnalysis?.atsScore ?? data.aiAnalysis?.overallScore ?? 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans antialiased text-neutral-900 pb-16 select-none">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                <button
                    onClick={() => navigate("/recruiter/applications")}
                    className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to Applications
                </button>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/recruiter/candidates/${applicationId}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-neutral-800 hover:bg-neutral-50 text-xs font-medium transition shadow-2xs"
                    >
                        <User size={14} /> View Full Dossier
                    </Link>
                    {(absoluteDirectUrl || backendStreamUrl) && (
                        <>
                            <a
                                href={absoluteDirectUrl || backendStreamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-neutral-800 hover:bg-neutral-50 text-xs font-medium transition shadow-2xs"
                            >
                                <ExternalLink size={14} /> Open in New Tab
                            </a>
                            <a
                                href={backendStreamUrl}
                                download={data.fileName || "Resume.pdf"}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs"
                            >
                                <Download size={14} /> Download Resume
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Header Summary Card */}
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold text-lg shrink-0">
                        {candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                                {candidateName}
                            </h1>
                            <StatusBadge status={status} />
                        </div>
                        <p className="text-xs font-medium text-neutral-500 mt-0.5">
                            Applied Job: <strong className="text-neutral-900">{jobTitle}</strong> ({email})
                        </p>
                    </div>
                </div>

                {/* Score & Education Stats */}
                <div className="flex items-center gap-6 text-xs">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">ATS Score</span>
                        <span className="text-2xl font-mono font-bold text-neutral-900">{atsScore}%</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Status</span>
                        <span className="text-xs font-semibold text-neutral-900 block">{status}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Education</span>
                        <span className="text-xs font-semibold text-neutral-900 truncate max-w-[140px] block">
                            {data.aiAnalysis?.education || "Not Specified"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Embedded Resume Container + Zoom Bar */}
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                {/* Header Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ECECEC]">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-neutral-600" />
                        <span className="text-xs font-semibold text-neutral-900">Original Document Viewer</span>
                        <span className="text-[11px] font-mono text-neutral-400 ml-1">
                            ({data.fileName || "resume.pdf"})
                        </span>
                    </div>

                    {/* Viewer Action Controls */}
                    <div className="flex items-center gap-2 text-xs">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                            title="Zoom Out"
                        >
                            <ZoomOut size={15} />
                        </button>
                        <span className="font-mono text-xs font-semibold text-neutral-600 px-1">
                            {zoom}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                            title="Zoom In"
                        >
                            <ZoomIn size={15} />
                        </button>
                        <button
                            onClick={handleFitWidth}
                            className="px-2.5 py-1 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                            title="Fit Width"
                        >
                            <Maximize2 size={13} /> Fit Width
                        </button>

                        {(absoluteDirectUrl || backendStreamUrl) && (
                            <>
                                <a
                                    href={absoluteDirectUrl || backendStreamUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-lg border border-[#ECECEC] text-neutral-800 hover:bg-neutral-100 font-medium text-[11px] transition inline-flex items-center gap-1"
                                >
                                    <ExternalLink size={13} /> Open in New Tab
                                </a>
                                <a
                                    href={backendStreamUrl}
                                    download={data.fileName || "Resume.pdf"}
                                    className="px-3 py-1 rounded-lg bg-neutral-900 text-white hover:bg-black font-medium text-[11px] transition inline-flex items-center gap-1"
                                >
                                    <Download size={13} /> Download Resume
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* Document Canvas Container */}
                {rawResumeUrl ? (
                    <div className="w-full bg-neutral-100 rounded-xl overflow-hidden min-h-[680px] border border-[#ECECEC] flex justify-center p-2">
                        <div
                            className="w-full transition-transform duration-200"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                        >
                            <object
                                data={viewerUrl}
                                type="application/pdf"
                                className="w-full h-[720px] rounded-xl bg-white shadow-xs"
                            >
                                <iframe
                                    src={viewerUrl}
                                    title="Original Candidate Resume"
                                    className="w-full h-[720px] border-0 rounded-xl bg-white shadow-xs"
                                />
                            </object>
                        </div>
                    </div>
                ) : (
                    <div className="p-16 text-center text-xs font-medium text-neutral-400 bg-neutral-50 rounded-xl">
                        No original uploaded resume document found in database for this applicant.
                    </div>
                )}
            </div>

            {/* Candidate Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                        <Code size={16} className="text-neutral-700" />
                        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                            Candidate Skills
                        </h3>
                    </div>
                    <div className="space-y-3 text-xs">
                        <div>
                            <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">Matched Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(data.aiAnalysis?.matchedSkills || []).length > 0 ? (
                                    data.aiAnalysis.matchedSkills.map((sk: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium">
                                            {sk}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-neutral-400 italic">None extracted</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">Skill Gaps</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(data.aiAnalysis?.missingSkills || []).length > 0 ? (
                                    data.aiAnalysis.missingSkills.map((sk: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-medium">
                                            {sk}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-neutral-400 italic">No missing skills detected</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experience & Education */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                        <Briefcase size={16} className="text-neutral-700" />
                        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                            Experience & Education Details
                        </h3>
                    </div>
                    <div className="space-y-4 text-xs">
                        <div className="flex items-start gap-3">
                            <Briefcase size={15} className="text-neutral-400 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-neutral-900">Work Experience</h4>
                                <p className="text-neutral-600 mt-0.5">
                                    {data.aiAnalysis?.experience?.candidate ?? 0} Years total candidate experience (Required: {data.aiAnalysis?.experience?.required ?? 0} Years)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-2 border-t border-[#ECECEC]">
                            <GraduationCap size={15} className="text-neutral-400 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-neutral-900">Education Credentials</h4>
                                <p className="text-neutral-600 mt-0.5">
                                    {data.aiAnalysis?.education || "Not specified in resume"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeViewerPage;
