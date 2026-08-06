import { Search } from "lucide-react";

import type { Job } from "../../types/job";

interface Props {
    jobs: Job[];
    selectedJob: string;
    onJobChange: (jobId: string) => void;
}

const ApplicationFilters = ({
    jobs,
    selectedJob,
    onJobChange,
}: Props) => {
    return (
        <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    placeholder="Search candidates..."
                    className="h-11 w-80 rounded-xl border border-gray-200 pl-11 outline-none focus:border-black"
                />
            </div>

            <select className="h-11 rounded-xl border border-gray-200 px-4">
                <option>Status</option>
                <option>Pending</option>
                <option>Reviewed</option>
                <option>Shortlisted</option>
                <option>Rejected</option>
            </select>

            <select
                value={selectedJob}
                onChange={(e) => onJobChange(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-4"
            >
                {jobs.length === 0 ? (
                    <option value="">
                        No Jobs Available
                    </option>
                ) : (
                    jobs.map((job) => (
                        <option
                            key={job._id}
                            value={job._id}
                        >
                            {job.title}
                        </option>
                    ))
                )}
            </select>

            <select className="h-11 rounded-xl border border-gray-200 px-4">
                <option>AI Score</option>
                <option>90+</option>
                <option>80+</option>
                <option>70+</option>
                <option>60+</option>
            </select>
        </div>
    );
};

export default ApplicationFilters;
