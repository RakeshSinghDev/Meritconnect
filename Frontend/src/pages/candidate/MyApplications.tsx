import { useEffect, useState } from "react";
import { FileText, MapPin, Briefcase, Calendar, Search } from "lucide-react";
import { getCandidateApplications } from "../../services/candidate.service";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

interface Application {
    applicationId: string;
    jobTitle: string;
    company: string;
    location: string;
    employmentType: string;
    salary: string;
    status: string;
    atsScore: number;
    appliedAt: string;
}

const MyApplications = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const data = await getCandidateApplications();
                setApplications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, []);

    const filtered = applications.filter((app) => {
        const q = searchQuery.toLowerCase();
        return (
            (app.jobTitle || "").toLowerCase().includes(q) ||
            (app.company || "").toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Loading submitted applications...
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <FileText className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Submissions Tracker</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        My Applications
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Inspect application statuses, resume match scores, and interview invites.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search application or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 w-full transition shadow-2xs"
                    />
                </div>
            </div>

            {/* List or Empty */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ECECEC] bg-white p-12 text-center space-y-2">
                    <FileText size={28} className="mx-auto text-neutral-300" />
                    <h2 className="text-xs font-semibold text-neutral-700">No Applications Found</h2>
                    <p className="text-[11px] text-neutral-400">
                        You have not submitted any applications matching this query.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((application) => (
                        <div
                            key={application.applicationId}
                            className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-200"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
                                            {application.jobTitle}
                                        </h2>
                                        <StatusBadge status={application.status} />
                                    </div>
                                    <p className="text-xs font-medium text-neutral-500">
                                        {application.company}
                                    </p>

                                    <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-500">
                                        {application.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} className="text-neutral-400" />
                                                {application.location}
                                            </span>
                                        )}
                                        {application.employmentType && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={13} className="text-neutral-400" />
                                                {application.employmentType}
                                            </span>
                                        )}
                                        {application.salary && (
                                            <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                                                {application.salary}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-left sm:text-right shrink-0">
                                    <p className="text-[10px] uppercase font-semibold text-neutral-400">
                                        ATS Match Score
                                    </p>
                                    <p className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                                        {application.atsScore}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ECECEC] flex items-center justify-between text-xs text-neutral-400">
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                    <Calendar size={13} />
                                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;