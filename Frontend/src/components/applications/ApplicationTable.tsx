import {
    Download,
    Eye,
    User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { Application } from "../../types/application";
import CandidateScore from "./CandidateScore";
import ApplicationStatus from "./ApplicationStatus";

interface Props {
    applications: Application[];

    onStatusChange: (
        applicationId: string,
        status:
            | "Pending"
            | "Reviewed"
            | "Shortlisted"
            | "Rejected"
    ) => void;

    onView?: (id: string) => void;
    onResume?: (id: string) => void;
    onAIAnalysis?: (id: string) => void;
}

const ApplicationTable = ({
    applications,
    onStatusChange,
}: Props) => {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-sans">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-[#ECECEC] bg-neutral-50/60 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="px-5 py-3.5">Candidate</th>
                            <th className="px-5 py-3.5">Contact Email</th>
                            <th className="px-5 py-3.5">ATS Match</th>
                            <th className="px-5 py-3.5">Application Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#ECECEC]">
                        {applications.map((application) => {
                            // Extract real data safely from populated candidate, aiAnalysis, and resume objects
                            const candidateName =
                                application.candidate?.name ||
                                application.candidateName ||
                                "Candidate";

                            const email =
                                application.candidate?.email ||
                                application.email ||
                                "N/A";

                            const phone =
                                application.candidate?.profile?.phone ||
                                application.phone ||
                                "";

                            const atsScore =
                                application.aiAnalysis?.atsScore ??
                                application.aiAnalysis?.overallScore ??
                                application.score ??
                                0;

                            const resumeUrl =
                                application.resume?.url ||
                                (typeof application.resume === "string" ? application.resume : "") ||
                                application.candidate?.profile?.resume?.url ||
                                "";

                            return (
                                <tr
                                    key={application._id}
                                    className="hover:bg-neutral-50/60 transition"
                                >
                                    {/* Candidate Name & Info */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                                {candidateName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/recruiter/candidates/${application._id}`}
                                                    className="font-semibold text-neutral-900 hover:underline"
                                                >
                                                    {candidateName}
                                                </Link>
                                                {phone && (
                                                    <p className="text-[11px] text-neutral-400">
                                                        {phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact Email */}
                                    <td className="px-5 py-4 text-neutral-600 font-medium">
                                        {email}
                                    </td>

                                    {/* ATS Match Score */}
                                    <td className="px-5 py-4">
                                        <CandidateScore score={atsScore} />
                                    </td>

                                    {/* Application Status */}
                                    <td className="px-5 py-4">
                                        <ApplicationStatus status={application.status} />
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Eye Icon -> Open Candidate Resume Viewer */}
                                            <button
                                                onClick={() =>
                                                    navigate(`/recruiter/applications/${application._id}/resume`)
                                                }
                                                className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
                                                title="Open Candidate Resume Viewer"
                                            >
                                                <Eye size={15} />
                                            </button>

                                            {/* Full Candidate Dossier Button */}
                                            <Link
                                                to={`/recruiter/candidates/${application._id}`}
                                                className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition"
                                                title="View Full Candidate Dossier"
                                            >
                                                <User size={15} />
                                            </Link>

                                            {/* Download Original Resume */}
                                            {resumeUrl && (
                                                <a
                                                    href={resumeUrl}
                                                    download
                                                    className="p-1.5 rounded-lg border border-[#ECECEC] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition inline-block"
                                                    title="Download Resume PDF"
                                                >
                                                    <Download size={15} />
                                                </a>
                                            )}

                                            {/* Shortlist Action */}
                                            <button
                                                onClick={() =>
                                                    onStatusChange(application._id, "Shortlisted")
                                                }
                                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 font-medium text-[11px] transition cursor-pointer"
                                                title="Shortlist Candidate"
                                            >
                                                Shortlist
                                            </button>

                                            {/* Reject Action */}
                                            <button
                                                onClick={() =>
                                                    onStatusChange(application._id, "Rejected")
                                                }
                                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 font-medium text-[11px] transition cursor-pointer"
                                                title="Reject Candidate"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationTable;