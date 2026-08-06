import type { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: ReactNode;
}

export default function StatCard({
    title,
    value,
    change,
    icon,
}: StatCardProps) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        {value}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-emerald-600">
                        {change}
                    </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                    {icon}
                </div>
            </div>
        </div>
    );
}