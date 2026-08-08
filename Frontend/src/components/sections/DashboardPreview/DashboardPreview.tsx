import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Container from "../../common/Container";
import DashboardStats from "./DashboardStats";
import ResumeAnalysisCard from "./ResumeAnalysisCard";
import AIInterviewCard from "./AIInterviewCard";

export default function DashboardPreview() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 100, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 100, damping: 30 });

    const rotateX = useTransform(mouseY, [-200, 200], [4, -4]);
    const rotateY = useTransform(mouseX, [-200, 200], [-4, 4]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <section id="dashboard" className="bg-gray-50 py-32">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500"
                    >
                        Dashboard
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-4 text-5xl font-semibold tracking-tight text-gray-900"
                    >
                        AI-powered recruitment at a glance
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-6 text-lg leading-8 text-gray-600"
                    >
                        Monitor candidates, applications, interviews, and hiring
                        performance from one intelligent dashboard.
                    </motion.p>
                </div>

                <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    initial={{ opacity: 0, y: 32, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-20 perspective-1000"
                >
                    <DashboardStats />

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <ResumeAnalysisCard />
                        <AIInterviewCard />
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
