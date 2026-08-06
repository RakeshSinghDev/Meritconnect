import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
    to: string;
    icon: LucideIcon;
    label: string;
}

const SidebarItem = ({ to, icon: Icon, label }: SidebarItemProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-150 ${
                    isActive
                        ? "bg-neutral-900 text-white shadow-2xs font-semibold"
                        : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
                }`
            }
        >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
        </NavLink>
    );
};

export default SidebarItem;