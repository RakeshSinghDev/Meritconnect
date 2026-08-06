import { useEffect, useState } from "react";
import Button from "../ui/Button";
import type { Job } from "../../types/job";

type JobFormData = Omit<Job, "_id" | "isActive" | "createdAt">;

const emptyForm: JobFormData = {
    title: "", company: "", location: "", employmentType: "Full-Time",
    salary: 0, description: "", skills: [], experience: 0,
};

interface Props {
    initialData?: Job | null;
    onSubmit: (job: JobFormData) => void;
    onCancel: () => void;
}

const JobForm = ({
    initialData,
    onSubmit,
    onCancel,
}: Props) => {
    const [form, setForm] = useState<JobFormData>(emptyForm);

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title,
                company: initialData.company,
                location: initialData.location,
                employmentType: initialData.employmentType,
                salary: initialData.salary,
                description: initialData.description,
                skills: initialData.skills,
                experience: initialData.experience,
            });
        } else {
            setForm(emptyForm);
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.name === "salary" || e.target.name === "experience"
                ? Number(e.target.value)
                : e.target.value,
        }));
    };

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !form.title.trim() ||
            !form.company.trim() || !form.location.trim() || form.salary < 0 || form.skills.length === 0
        ) {
            alert("Please fill all required fields.");
            return;
        }

        onSubmit(form);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Job Title
                </label>

                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Company
                </label>

                <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="MeritConnect"
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Location
                    </label>

                    <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Remote"
                        className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Employment Type
                    </label>

                    <select
                        name="employmentType"
                        value={form.employmentType}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 p-3"
                    >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Salary
                </label>

                <input
                    name="salary"
                    type="number"
                    min="0"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="₹8–12 LPA"
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="mb-2 block text-sm font-medium">Required Skills</label>
                    <input
                        value={form.skills.join(", ")}
                        onChange={(e) => setForm((prev) => ({
                            ...prev,
                            skills: e.target.value.split(",").map((skill) => skill.trim()).filter(Boolean),
                        }))}
                        placeholder="React, Node.js, MongoDB"
                        className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium">Experience (years)</label>
                    <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black" />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Description
                </label>

                <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </Button>

                <Button type="submit">
                    {initialData ? "Update Job" : "Create Job"}
                </Button>
            </div>
        </form>
    );
};

export default JobForm;
