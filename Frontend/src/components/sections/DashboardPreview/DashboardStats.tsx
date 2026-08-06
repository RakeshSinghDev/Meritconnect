import {
    Users,
    BriefcaseBusiness,
    ClipboardCheck,
    TrendingUp,
} from "lucide-react";

import StatCard from "./StatCard";

const stats = [
    {
        title: "Candidates",
        value: "842",
        change: "+18%",
        icon: <Users size={24} />,
    },
    {
        title: "Applications",
        value: "1,267",
        change: "+25%",
        icon: <BriefcaseBusiness size={24} />,
    },
    {
        title: "AI Interviews",
        value: "94",
        change: "+12%",
        icon: <ClipboardCheck size={24} />,
    },
    {
        title: "Hiring Rate",
        value: "92%",
        change: "+8%",
        icon: <TrendingUp size={24} />,
    },
];

export default function DashboardStats() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))}
        </div>
    );
}