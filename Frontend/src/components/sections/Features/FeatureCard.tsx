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
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            whileHover={{ y: -8, rotate: 0.5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="group rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5"
        >
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
