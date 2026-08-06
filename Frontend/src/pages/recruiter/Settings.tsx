import React, { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Sparkles, Save, Check } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import toast from "react-hot-toast";

export default function Settings() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [aiAutoScreen, setAiAutoScreen] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        toast.success("Workspace preferences updated");
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="pb-6 border-b border-[#ECECEC]">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                    <SettingsIcon className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Workspace Settings</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                    Account & Preferences
                </h1>
                <p className="mt-0.5 text-xs text-neutral-500">
                    Manage your recruiter identity, notifications, and AI agent configuration.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Card */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-500" /> Recruiter Profile
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block text-neutral-500 font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-neutral-500 font-medium mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-50 border border-[#ECECEC] rounded-xl p-2.5 text-neutral-900 outline-none focus:border-neutral-400 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Preferences */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600" /> AI Agent Preferences
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                            <div>
                                <p className="font-semibold text-neutral-900">Autonomous Resume Screening</p>
                                <p className="text-[11px] text-neutral-500">Automatically compute ATS match scores upon candidate submission</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={aiAutoScreen}
                                onChange={(e) => setAiAutoScreen(e.target.checked)}
                                className="h-4 w-4 rounded accent-neutral-900 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                            <div>
                                <p className="font-semibold text-neutral-900">Email Activity Digests</p>
                                <p className="text-[11px] text-neutral-500">Receive daily summary emails of completed AI video interviews</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailAlerts}
                                onChange={(e) => setEmailAlerts(e.target.checked)}
                                className="h-4 w-4 rounded accent-neutral-900 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Save CTA */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-medium transition shadow-xs cursor-pointer"
                    >
                        {saved ? <Check size={16} /> : <Save size={16} />}
                        {saved ? "Saved!" : "Save Preferences"}
                    </button>
                </div>
            </form>
        </div>
    );
}