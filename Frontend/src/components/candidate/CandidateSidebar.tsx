import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    User,
    Bot,
    Settings,
    LogOut,
} from "lucide-react";
import SidebarItem from "../dashboard/Sidebar/SidebarItem";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/candidate/dashboard",
    },
    {
        label: "Jobs",
        icon: BriefcaseBusiness,
        path: "/candidate/jobs",
    },
    {
        label: "My Applications",
        icon: FileText,
        path: "/candidate/applications",
    },
    {
        label: "AI Interviews",
        icon: Bot,
        path: "/candidate/ai-interviews",
    },
    {
        label: "Profile",
        icon: User,
        path: "/candidate/profile",
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/candidate/settings",
    },
];

const CandidateSidebar = () => {
    const navigate = useNavigate();
    const { user, logoutUser } = useAuth();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    return (
        <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-[#ECECEC] bg-white select-none">
            {/* Logo */}
            <div className="border-b border-[#ECECEC] px-6 py-6">
                <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Merit<span className="text-neutral-400">Connect</span>
                </h1>
                <p className="mt-0.5 text-xs text-neutral-400 font-medium">
                    Candidate Workspace
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.path}
                        to={item.path}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </nav>

            {/* User */}
            <div className="border-t border-[#ECECEC] p-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-[#ECECEC] p-3 bg-neutral-50/50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-neutral-900 truncate">
                            {user?.name || "Candidate"}
                        </h3>
                        <p className="text-[11px] text-neutral-400 truncate capitalize">
                            Candidate
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ECECEC] py-2.5 text-xs font-medium text-neutral-700 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default CandidateSidebar;