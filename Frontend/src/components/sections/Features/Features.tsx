import {
    Brain,
    Search,
    BarChart3,
    Clock3,
} from "lucide-react";

import Container from "../../common/Container";
import FeatureCard from "./FeatureCard";
import { motion } from "framer-motion";

const features = [
    {
        icon: <Brain size={28} />,
        title: "AI Resume Analysis",
        description:
            "Automatically evaluate resumes using AI to identify the most relevant candidates within seconds.",
    },
    {
        icon: <Search size={28} />,
        title: "Smart Candidate Matching",
        description:
            "Match candidates to jobs based on skills, experience, and qualifications instead of keywords alone.",
    },
    {
        icon: <BarChart3 size={28} />,
        title: "Recruitment Analytics",
        description:
            "Track hiring performance with detailed dashboards, reports, and AI-generated insights.",
    },
    {
        icon: <Clock3 size={28} />,
        title: "Faster Hiring Workflow",
        description:
            "Reduce manual screening and speed up hiring with an intelligent end-to-end recruitment pipeline.",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-28 md:py-36">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                        Features
                    </p>

                    <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                        Everything recruiters need in one platform
                    </h2>

                    <p className="mt-6 text-lg text-gray-600">
                        From AI-powered resume screening to intelligent candidate
                        matching, MeritConnect simplifies every step of the hiring
                        process.
                    </p>
                </div>

                <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .1 } } }} className="mt-16 grid gap-5 md:grid-cols-2">
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: .45 } } }}><FeatureCard
                            key={feature.title}
                            {...feature}
                        /></motion.div>
                    ))}
                </motion.div>
            </Container>
        </section>
    );
}
