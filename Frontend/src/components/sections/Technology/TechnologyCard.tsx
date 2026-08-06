import type { ReactNode } from "react";

interface TechnologyCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export default function TechnologyCard({
    icon,
    title,
    description,
}: TechnologyCardProps) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                {icon}
            </div>

            <h3 className="text-xl font-semibold text-gray-900">
                {title}
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
                {description}
            </p>
        </div>
    );
}