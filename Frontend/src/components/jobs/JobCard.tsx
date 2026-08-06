import { useState } from "react";
import {
    Calendar,
    MapPin,
    Pencil,
    Trash2,
    Briefcase,
} from "lucide-react";

import type { Job } from "../../types/job";

import JobStatusBadge from "./JobStatusBadge";
import ConfirmDialog from "../ui/ConfirmDialog";

interface Props {
    job: Job;
    onEdit: (job: Job) => void;
    onDelete: (id: string) => Promise<void>;
}

const JobCard = ({
    job,
    onEdit,
    onDelete,
}: Props) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await onDelete(job._id);
            setConfirmOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                            {job.title}
                        </h2>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            {job.company}
                        </p>
                    </div>

                    <JobStatusBadge
                        status={job.isActive ? "Active" : "Closed"}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-neutral-400" />
                        {job.location}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-neutral-400" />
                        {job.employmentType}
                    </span>

                    {job.salary && (
                        <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {job.salary}
                        </span>
                    )}

                    <span className="flex items-center gap-1.5 ml-auto text-neutral-400">
                        <Calendar size={14} />
                        {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <p className="mt-4 line-clamp-2 text-xs text-neutral-600 leading-relaxed">
                    {job.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[#ECECEC] flex items-center justify-end gap-2.5">
                    <button
                        onClick={() => onEdit(job)}
                        className="flex items-center gap-1.5 rounded-xl border border-[#ECECEC] px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer"
                    >
                        <Pencil size={13} />
                        Edit
                    </button>

                    <button
                        disabled={deleting}
                        onClick={() => setConfirmOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 px-3.5 py-1.5 text-xs font-medium transition hover:bg-rose-100 cursor-pointer disabled:opacity-60"
                    >
                        <Trash2 size={13} />
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Job Posting"
                description="This action cannot be undone. Are you sure you want to permanently remove this job posting?"
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={deleting}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default JobCard;
