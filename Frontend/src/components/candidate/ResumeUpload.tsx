import { useEffect, useState } from "react";
import {
    uploadResume,
    getResume,
    deleteResume,
} from "../../services/resume.service";

interface Resume {
    url: string;
    fileName: string;
}

const ResumeUpload = () => {
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(false);

    const loadResume = async () => {
        try {
            const data = await getResume();
            setResume(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadResume();
    }, []);

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            setLoading(true);

            await uploadResume(file);

            await loadResume();

            alert("Resume uploaded successfully.");
        } catch (err) {
            console.error(err);
            alert("Resume upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteResume();

            setResume(null);

            alert("Resume deleted.");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="rounded-2xl border bg-white p-6">

            <h2 className="mb-6 text-2xl font-semibold">
                Resume
            </h2>

            {resume?.url ? (
                <>

                    <div className="rounded-xl border p-4">

                        <p className="font-medium">
                            {resume.fileName}
                        </p>

                        <a
                            href={resume.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-blue-600"
                        >
                            View Resume
                        </a>

                    </div>

                    <button
                        onClick={handleDelete}
                        className="mt-5 rounded-xl bg-red-600 px-5 py-2 text-white"
                    >
                        Delete Resume
                    </button>

                </>
            ) : (
                <div>

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                    />

                    {loading && (
                        <p className="mt-3 text-gray-500">
                            Uploading...
                        </p>
                    )}

                </div>
            )}

        </div>
    );
};

export default ResumeUpload;
