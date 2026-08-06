import { useEffect, useState } from "react";
import { Plus, Briefcase, Sparkles } from "lucide-react";

import Drawer from "../../components/ui/Drawer";
import EmptyJobs from "../../components/jobs/EmptyJobs";
import JobFilters from "../../components/jobs/JobFilters";
import JobForm from "../../components/jobs/JobForm";
import JobCard from "../../components/jobs/JobCard";

import {
    getMyJobs,
    createJob,
    updateJob,
    deleteJob,
} from "../../services/job.service";

import type {
    Job,
    CreateJobDto,
    UpdateJobDto,
} from "../../types/job";

const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await getMyJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleCreate = async (form: CreateJobDto) => {
        try {
            await createJob(form);
            setOpen(false);
            await loadJobs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (form: UpdateJobDto) => {
        if (!editingJob) return;

        try {
            await updateJob(editingJob._id, form);
            setEditingJob(null);
            setOpen(false);
            await loadJobs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteJob(id);
            await loadJobs();
        } catch (error) {
            console.error(error);
        }
    };

    const hasJobs = jobs.length > 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECECEC]">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                        <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Recruiter Management</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                        Job Openings
                    </h1>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Create, inspect, and manage active talent requisitions.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingJob(null);
                        setOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer self-start sm:self-auto"
                >
                    <Plus size={16} />
                    Create Job Opening
                </button>
            </div>

            {/* Filter controls */}
            <JobFilters />

            {/* List / Loading / Empty */}
            {loading ? (
                <div className="grid gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 bg-white rounded-2xl border border-[#ECECEC]" />
                    ))}
                </div>
            ) : hasJobs ? (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <JobCard
                            key={job._id}
                            job={job}
                            onEdit={(jobToEdit) => {
                                setEditingJob(jobToEdit);
                                setOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyJobs
                    onCreateJob={() => {
                        setEditingJob(null);
                        setOpen(true);
                    }}
                />
            )}

            {/* Create/Edit Drawer */}
            <Drawer
                open={open}
                title={editingJob ? "Edit Requisition" : "Create New Job Requisition"}
                onClose={() => {
                    setEditingJob(null);
                    setOpen(false);
                }}
            >
                <JobForm
                    initialData={editingJob}
                    onCancel={() => {
                        setEditingJob(null);
                        setOpen(false);
                    }}
                    onSubmit={(form) => {
                        if (editingJob) {
                            handleUpdate(form);
                        } else {
                            handleCreate(form);
                        }
                    }}
                />
            </Drawer>
        </div>
    );
};

export default Jobs;