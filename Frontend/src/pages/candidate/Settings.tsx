import React, { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Save, Check } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import toast from "react-hot-toast";

export default function CandidateSettings() {
    const { user } = useAuth();
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [interviewReminders, setInterviewReminders] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        toast.success("Preferences updated");
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto font-sans antialiased text-neutral-900">
            {/* Header */}
            <div className="pb-6 border-b border-[#ECECEC]">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                    <SettingsIcon className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Candidate Preferences</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                    Account Settings
                </h1>
                <p className="mt-0.5 text-xs text-neutral-500">
                    Manage notification alerts, privacy, and account security.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Account Details */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-500" /> Account Security
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                            <p className="font-semibold text-neutral-900">Registered Email</p>
                            <p className="text-neutral-500 mt-0.5">{user?.email || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-neutral-500" /> Notification Preferences
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                            <div>
                                <p className="font-semibold text-neutral-900">Application Status Alerts</p>
                                <p className="text-[11px] text-neutral-500">Receive instant updates when a recruiter reviews or shortlists your resume</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailAlerts}
                                onChange={(e) => setEmailAlerts(e.target.checked)}
                                className="h-4 w-4 rounded accent-neutral-900 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-[#ECECEC]">
                            <div>
                                <p className="font-semibold text-neutral-900">AI Interview Reminders</p>
                                <p className="text-[11px] text-neutral-500">Get video room invitations and countdown reminders before your session</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={interviewReminders}
                                onChange={(e) => setInterviewReminders(e.target.checked)}
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
