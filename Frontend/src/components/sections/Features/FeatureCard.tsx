import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export default function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: .25 }} className="group rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white transition-transform group-hover:scale-105">
                {icon}
            </div>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
                {description}
            </p>
        </motion.div>
    );
}
