import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BriefcaseBusiness,
    Clock,
    MapPin,
} from "lucide-react";

import { getJobById } from "../../services/job.service";
import type { Job } from "../../types/job";

const JobDetails = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [job, setJob] = useState<Job | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        const fetchJob = async () => {

            try {

                if (!id) return;

                const data =
                    await getJobById(id);

                setJob(data);

            } catch (err) {

                console.error(err);

                setError("Unable to load job.");

            } finally {

                setLoading(false);

            }

        };

        fetchJob();

    }, [id]);

    if (loading) {

        return (
            <div className="flex h-96 items-center justify-center">
                Loading...
            </div>
        );

    }

    if (error) {

        return (
            <div className="flex h-96 items-center justify-center text-red-500">
                {error}
            </div>
        );

    }

    if (!job) {

        return (
            <div className="flex h-96 items-center justify-center">
                Job not found.
            </div>
        );

    }

    return (

        <div className="mx-auto max-w-5xl space-y-8">

            <div className="rounded-3xl border border-gray-200 bg-white p-8">

                <h1 className="text-4xl font-bold">
                    {job.title}
                </h1>

                <p className="mt-2 text-lg text-gray-500">
                    {job.company}
                </p>

                <div className="mt-6 flex flex-wrap gap-6 text-gray-600">

                    <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        {job.location}
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        {job.employmentType}
                    </div>

                    <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={18} />
                        {job.salary}
                    </div>

                </div>

            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8">

                <h2 className="mb-5 text-2xl font-semibold">
                    Job Description
                </h2>

                <p className="whitespace-pre-line leading-8 text-gray-600">
                    {job.description}
                </p>

            </div>

            <div className="flex justify-end">

                <button
                    onClick={() =>
                        navigate(`/candidate/jobs/${job._id}/apply`)
                    }
                    className="rounded-xl bg-black px-8 py-3 text-white hover:bg-gray-800"
                >
                    Apply Now
                </button>

            </div>

        </div>

    );

};

export default JobDetails;