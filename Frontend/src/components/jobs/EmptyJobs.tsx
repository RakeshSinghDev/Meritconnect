import { BriefcaseBusiness } from "lucide-react";
import Button from "../ui/Button";

interface EmptyJobsProps {
    onCreateJob: () => void;
}

const EmptyJobs = ({ onCreateJob }: EmptyJobsProps) => {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-24">
            <div className="mb-5 rounded-full bg-gray-100 p-5">
                <BriefcaseBusiness size={42} />
            </div>

            <h2 className="text-2xl font-semibold">
                No jobs created yet
            </h2>

            <p className="mt-3 max-w-md text-center text-gray-500">
                Create your first AI-powered job posting and start
                receiving applications from candidates.
            </p>

            <div className="mt-8">
                <Button onClick={onCreateJob}>
                    + Create Job
                </Button>
            </div>
        </div>
    );
};

export default EmptyJobs;