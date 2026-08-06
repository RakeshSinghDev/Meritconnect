import { useEffect, useState } from "react";
import { FileText, Download, Filter } from "lucide-react";

import ApplicationFilters from "../../components/applications/ApplicationFilters";
import EmptyApplications from "../../components/applications/EmptyApplications";
import ApplicationTable from "../../components/applications/ApplicationTable";

import {
    getJobApplications,
    updateApplicationStatus,
} from "../../services/application.service";

import { getMyJobs } from "../../services/job.service";

import type { Application } from "../../types/application";
import type { Job } from "../../types/job";

const Applications = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        try {
            const data = await getMyJobs();
            const jobList = Array.isArray(data) ? data : [];
            setJobs(jobList);
            if (jobList.length) {
                setSelectedJob(jobList[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadApplications = async (jobId: string) => {
        try {
            setLoading(true);
            const data = await getJobApplications(jobId);
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            loadApplications(selectedJob);
        }
    }, [selectedJob]);

    const changeStatus = async (
        applicationId: string,
        status: "Pending" | "Reviewed" | "Shortlisted" | "Rejected"
    ) => {
        try {
            await updateApplicationStatus(applicationId, status);
            await loadApplications(selectedJob);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <FileText className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Candidate Submissions</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Applications
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Review ATS scores, manage stage transitions, and schedule candidate rounds.
                    </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#ECECEC] text-neutral-800 hover:bg-neutral-50 text-xs font-medium transition cursor-pointer self-start sm:self-auto shadow-2xs">
                    <Download size={15} />
                    Export Submissions
                </button>
            </div>

            {/* Filters */}
            <ApplicationFilters
                jobs={jobs}
                selectedJob={selectedJob}
                onJobChange={setSelectedJob}
            />

            {/* List / Loading / Empty */}
            {loading ? (
                <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl">
                    Loading applications...
                </div>
            ) : applications.length === 0 ? (
                <EmptyApplications />
            ) : (
                <ApplicationTable
                    applications={applications}
                    onStatusChange={changeStatus}
                />
            )}
        </div>
    );
};

export default Applications;
