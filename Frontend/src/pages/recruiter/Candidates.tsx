import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Filter, Mail, Phone, ArrowUpRight, Sparkles, Brain } from "lucide-react";
import { getMyJobs } from "../../services/job.service";
import { getJobApplications } from "../../services/application.service";
import type { Application } from "../../types/application";
import type { Job } from "../../types/job";
import { StatusBadge } from "../../components/ui/recruiterDesignSystem";

export default function Candidates() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");

    useEffect(() => {
        const loadAllCandidates = async () => {
            try {
                setLoading(true);
                const myJobs = await getMyJobs();
                setJobs(Array.isArray(myJobs) ? myJobs : []);

                if (Array.isArray(myJobs) && myJobs.length > 0) {
                    const appsPromises = myJobs.map((j) =>
                        getJobApplications(j._id).catch(() => [])
                    );
                    const results = await Promise.all(appsPromises);
                    const flattened = results.flat();
                    setAllApplications(flattened);
                }
            } catch (err) {
                console.error("Failed to load candidates:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAllCandidates();
    }, []);

    const filteredCandidates = allApplications.filter((app) => {
        const matchesQuery =
            (app.candidateName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedStatus === "All" ||
            (app.status || "").toLowerCase() === selectedStatus.toLowerCase();
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Talent Directory</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Candidates
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Search and filter all evaluated applicants across active job postings.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search candidate name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 w-full transition shadow-2xs"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-3.5 w-3.5 text-neutral-400" />
                    <div className="flex items-center gap-1 bg-white border border-[#ECECEC] p-1 rounded-xl text-xs">
                        {["All", "Shortlisted", "Reviewed", "Pending", "Rejected"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                                    selectedStatus === status
                                        ? "bg-neutral-900 text-white"
                                        : "text-neutral-600 hover:bg-neutral-50"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Candidate Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-44 bg-white rounded-2xl border border-[#ECECEC]" />
                    ))}
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#ECECEC] space-y-2">
                    <Users className="h-8 w-8 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">No Candidates Found</p>
                    <p className="text-[11px] text-neutral-400">
                        Try adjusting your search criteria or filter tags.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidates.map((candidate, idx) => (
                        <div
                            key={candidate._id || idx}
                            className="rounded-2xl bg-white border border-[#ECECEC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                        {(candidate.candidateName || "C").charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-900">
                                            {candidate.candidateName}
                                        </h3>
                                        <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                            <Mail className="h-3 w-3" /> {candidate.email}
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge status={candidate.status || "Pending"} />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[#ECECEC]">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500 font-medium">ATS Match Score</span>
                                    <span
                                        className={`font-mono font-semibold ${
                                            (candidate.score || 0) >= 80
                                                ? "text-emerald-700"
                                                : (candidate.score || 0) >= 60
                                                ? "text-amber-700"
                                                : "text-rose-700"
                                        }`}
                                    >
                                        {candidate.score || 0}%
                                    </span>
                                </div>

                                {candidate.phone && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                                        <Phone className="h-3 w-3 text-neutral-400" />
                                        <span>{candidate.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex items-center justify-end">
                                <Link
                                    to={`/recruiter/candidates/${candidate._id}`}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-[11px] font-medium transition shadow-2xs"
                                >
                                    View Full Dossier <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}