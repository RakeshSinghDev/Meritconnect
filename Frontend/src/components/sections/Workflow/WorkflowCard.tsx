import { motion } from "framer-motion";

interface WorkflowCardProps {
    step: string;
    title: string;
    description: string;
}

export default function WorkflowCard({
    step,
    title,
    description,
}: WorkflowCardProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xs transition-shadow hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5"
        >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                {step}
            </div>

            <h3 className="text-2xl font-semibold text-gray-900">
                {title}
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
                {description}
            </p>
        </motion.div>
    );
}
