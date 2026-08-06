import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, Save } from "lucide-react";


import ResumeUpload from "../../components/candidate/ResumeUpload";
import {
    getCurrentUser,
    updateCurrentUser,
} from "../../services/user.service";

interface ProfileForm {
    name: string;
    bio: string;
    phone: string;
    location: string;
    college: string;
    education: string;
    experience: number;
    currentCompany: string;
    currentPosition: string;
    github: string;
    linkedin: string;
    portfolio: string;
    skills: string;
}

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState<ProfileForm>({
        name: "",
        bio: "",
        phone: "",
        location: "",
        college: "",
        education: "",
        experience: 0,
        currentCompany: "",
        currentPosition: "",
        github: "",
        linkedin: "",
        portfolio: "",
        skills: "",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = await getCurrentUser();
                setProfile({
                    name: user.name || "",
                    bio: user.profile?.bio || "",
                    phone: user.profile?.phone || "",
                    location: user.profile?.location || "",
                    college: user.profile?.college || "",
                    education: user.profile?.education || "",
                    experience: user.profile?.experience || 0,
                    currentCompany: user.profile?.currentCompany || "",
                    currentPosition: user.profile?.currentPosition || "",
                    github: user.profile?.github || "",
                    linkedin: user.profile?.linkedin || "",
                    portfolio: user.profile?.portfolio || "",
                    skills: user.profile?.skills?.join(", ") || "",
                });
            } catch {
                toast.error("Failed to load profile details.");
            } finally {
                setLoading(false);
            }

        };

        loadProfile();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: name === "experience" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateCurrentUser(profile);
            toast.success("Profile updated successfully.");
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-xs font-medium text-neutral-400 animate-pulse bg-white border border-[#ECECEC] rounded-2xl max-w-7xl mx-auto">
                Loading profile information...
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="pb-6 border-b border-[#ECECEC]">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Candidate Profile & Dossier</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                    My Profile
                </h1>
                <p className="mt-0.5 text-xs text-neutral-500">
                    Keep your professional resume, experience, and contact information up-to-date.
                </p>
            </div>

            {/* Resume Upload Box */}
            <ResumeUpload />

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#ECECEC] bg-white p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
                <div className="grid gap-4 md:grid-cols-2 text-xs">
                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Full Name</label>
                        <input
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Phone</label>
                        <input
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Location</label>
                        <input
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">College / University</label>
                        <input
                            name="college"
                            value={profile.college}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Degree / Major</label>
                        <input
                            name="education"
                            value={profile.education}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Years of Experience</label>
                        <input
                            type="number"
                            name="experience"
                            value={profile.experience}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Current Company</label>
                        <input
                            name="currentCompany"
                            value={profile.currentCompany}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">Current Position / Title</label>
                        <input
                            name="currentPosition"
                            value={profile.currentPosition}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">GitHub Profile</label>
                        <input
                            name="github"
                            value={profile.github}
                            onChange={handleChange}
                            placeholder="https://github.com/..."
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-neutral-500">LinkedIn Profile</label>
                        <input
                            name="linkedin"
                            value={profile.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/..."
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block font-medium text-neutral-500">Portfolio Website</label>
                        <input
                            name="portfolio"
                            value={profile.portfolio}
                            onChange={handleChange}
                            placeholder="https://yourportfolio.com"
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block font-medium text-neutral-500">Bio Summary</label>
                        <textarea
                            rows={3}
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block font-medium text-neutral-500">Skills (Comma-separated)</label>
                        <textarea
                            rows={3}
                            name="skills"
                            value={profile.skills}
                            onChange={handleChange}
                            placeholder="React, TypeScript, Node.js, Python, System Design..."
                            className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <Save size={15} />
                        {saving ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;