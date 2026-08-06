import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applyJob } from "../../services/application.service";

const ApplyJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        coverLetter: "",
    });

    const [resume, setResume] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!resume) {

            alert("Please upload your resume.");

            return;

        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append(
                "coverLetter",
                form.coverLetter
            );

            formData.append(
                "resume",
                resume
            );

            await applyJob(
                id!,
                formData
            );

            alert(
                "Application submitted successfully."
            );

            navigate(
                "/candidate/applications"
            );

        } catch (error: any) {

            console.error(error);

            console.log("Axios Error:", error);

            console.log("Response:", error.response);

            console.log("Data:", error.response?.data);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to submit application."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8">

            <h1 className="mb-8 text-3xl font-bold">
                Apply for Job
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                <div>

                    <label className="mb-2 block font-medium">
                        Cover Letter
                    </label>

                    <textarea
                        rows={8}
                        value={form.coverLetter}
                        onChange={(e) =>
                            setForm({
                                coverLetter:
                                    e.target.value,
                            })
                        }
                        className="w-full rounded-xl border p-4"
                    />

                </div>

                <div>

                    <label className="mb-2 block font-medium">
                        Resume
                    </label>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                            setResume(
                                e.target.files?.[0] ||
                                null
                            )
                        }
                    />

                </div>

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black py-3 text-white"
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Application"}
                </button>

            </form>

        </div>

    );

};

export default ApplyJob;