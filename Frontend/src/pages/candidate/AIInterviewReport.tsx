import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAIInterviewStore } from "../../store/useAIInterviewStore";
import { InterviewReport } from "../../components/ai-interview/InterviewReport";
import { ArrowLeft, Sparkles, Download } from "lucide-react";

export const AIInterviewReportPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session, fetchSession, report } = useAIInterviewStore();

    useEffect(() => {
        if (id) fetchSession(id);
    }, [id]);

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-[#6E6E73] font-sans">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#1D1D1F] animate-spin" />
                    <span className="text-xs font-medium">Retrieving Interview Evaluation Report...</span>
                </div>
            </div>
        );
    }

    const handleDownloadPDF = () => {
        if (report?.pdfUrl && report.pdfUrl.startsWith("http")) {
            window.open(report.pdfUrl, "_blank");
        } else {
            window.print();
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-8 md:p-12 print:bg-white print:p-0 print:text-black font-sans antialiased select-none">
            {/* Header */}
            <div className="max-w-5xl mx-auto flex items-center justify-between pb-8 mb-8 border-b border-[#E8E8ED] print:hidden">
                <button
                    onClick={() => navigate("/candidate/ai-interviews")}
                    className="flex items-center gap-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to My AI Interviews
                </button>

                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1D1D1F] text-white text-xs font-medium hover:bg-black transition shadow-2xs cursor-pointer"
                >
                    <Download className="h-4 w-4" /> Download PDF Report
                </button>
            </div>

            <InterviewReport session={session} report={report} />
        </div>
    );
};

export default AIInterviewReportPage;
