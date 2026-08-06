import { FileText } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

const EmptyApplications = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-24">

            <div className="mb-5 rounded-full bg-gray-100 p-5">
                <FileText size={40} />
            </div>

            <h2 className="text-2xl font-semibold">
                No applications yet
            </h2>

            <p className="mt-3 max-w-lg text-center text-gray-500">
                Publish a job to start receiving applications from candidates.
            </p>

            <div className="mt-8">
                <Button onClick={() => navigate("/recruiter/jobs")}>
                    View Jobs
                </Button>
            </div>

        </div>
    );
};

export default EmptyApplications;