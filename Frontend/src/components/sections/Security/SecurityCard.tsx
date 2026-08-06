import type { ReactNode } from "react";

interface SecurityCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export default function SecurityCard({
    icon,
    title,
    description,
}: SecurityCardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[.06] p-8 transition hover:-translate-y-1 hover:bg-white/[.09]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-950">
                {icon}
            </div>

            <h3 className="mt-6 text-xl font-semibold text-white">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-neutral-400">
                {description}
            </p>
        </div>
    );
}
