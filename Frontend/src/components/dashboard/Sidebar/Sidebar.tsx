import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    Users,
    Bot,
    BarChart3,
    Bell,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../../store/AuthContext";

const navigationGroups = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, path: "/recruiter/dashboard" },
            { label: "Analytics", icon: BarChart3, path: "/recruiter/analytics" },
        ],
    },
    {
        title: "Hiring Engine",
        items: [
            { label: "Jobs", icon: BriefcaseBusiness, path: "/recruiter/jobs" },
            { label: "Applications", icon: FileText, path: "/recruiter/applications" },
            { label: "Candidates", icon: Users, path: "/recruiter/candidates" },
            { label: "AI Interviews", icon: Bot, path: "/recruiter/ai-interviews" },
        ],
    },
    {
        title: "Workspace",
        items: [
            { label: "Notifications", icon: Bell, path: "/recruiter/notifications" },
            { label: "Settings", icon: Settings, path: "/recruiter/settings" },
        ],
    },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logoutUser } = useAuth();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    return (
        <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-[#ECECEC]/60 bg-white select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
            {/* Logo */}
            <div className="border-b border-[#ECECEC]/60 px-6 py-5 flex items-center gap-3">
                <img src="/logo.svg" alt="MeritConnect Logo" className="h-8 w-8 rounded-lg" />
                <div>
                    <h1 className="text-base font-bold tracking-tight text-neutral-900 leading-none">
                        MeritConnect
                    </h1>
                    <p className="mt-0.5 text-[10px] text-neutral-400 font-medium">
                        Recruiter Workspace
                    </p>
                </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
                {navigationGroups.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                        <p className="px-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            {group.title}
                        </p>
                        <div className="space-y-0.5 pt-1">
                            {group.items.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    to={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="border-t border-[#ECECEC]/60 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#ECECEC]/60 p-2.5 bg-[#F7F8FA]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-xs font-semibold text-white shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || "R"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-neutral-900 truncate">
                            {user?.name || "Recruiter"}
                        </h3>
                        <p className="text-[10px] text-neutral-400 truncate capitalize">
                            {user?.role || "Recruiter"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ECECEC]/60 py-2 text-xs font-medium text-neutral-600 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200/60 cursor-pointer"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;