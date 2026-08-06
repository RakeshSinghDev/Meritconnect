import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    Clock,
    MapPin,
    Search,
    ChevronRight,
} from "lucide-react";

import { getJobs } from "../../services/job.service";
import type { Job } from "../../types/job";

const CandidateJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await getJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load active job postings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const filteredJobs = jobs.filter((j) => {
        const q = searchQuery.toLowerCase();
        return (
            (j.title || "").toLowerCase().includes(q) ||
            (j.company || "").toLowerCase().includes(q) ||
            (j.location || "").toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Loading job requisitions...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl max-w-7xl mx-auto">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <BriefcaseBusiness className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Career Opportunities</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Explore Openings
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Discover roles with instant AI ATS resume evaluation and automated interview matching.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search role, company, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 w-full transition shadow-2xs"
                    />
                </div>
            </div>

            {/* List or Empty */}
            {filteredJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ECECEC] bg-white p-12 text-center space-y-2">
                    <BriefcaseBusiness size={28} className="mx-auto text-neutral-300" />
                    <h2 className="text-xs font-semibold text-neutral-700">No Job Openings Found</h2>
                    <p className="text-[11px] text-neutral-400">
                        Check back later or adjust your search filter.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between space-y-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                                        {job.title}
                                    </h2>
                                    <p className="text-xs font-medium text-neutral-500 mt-0.5">
                                        {job.company}
                                    </p>
                                </div>

                                {job.salary && (
                                    <span className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md self-start">
                                        {job.salary}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-neutral-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-neutral-400" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-neutral-400" />
                                    {job.employmentType}
                                </span>
                            </div>

                            <p className="line-clamp-2 text-xs text-neutral-600 leading-relaxed">
                                {job.description}
                            </p>

                            <div className="pt-3 border-t border-[#ECECEC] flex items-center justify-end">
                                <button
                                    onClick={() => navigate(`/candidate/jobs/${job._id}`)}
                                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-black transition shadow-xs cursor-pointer"
                                >
                                    View Role Details <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateJobs;
