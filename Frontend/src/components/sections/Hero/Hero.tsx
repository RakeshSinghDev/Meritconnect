import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import Container from "../../common/Container";
import Button from "../../ui/Button";

import { useAuth } from "../../../store/AuthContext";

export default function Hero() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Mouse Parallax Setup
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });

    const badgeX = useTransform(smoothX, [-300, 300], [-8, 8]);
    const badgeY = useTransform(smoothY, [-300, 300], [-8, 8]);

    const titleX = useTransform(smoothX, [-300, 300], [-12, 12]);
    const titleY = useTransform(smoothY, [-300, 300], [-12, 12]);

    const textX = useTransform(smoothX, [-300, 300], [-6, 6]);
    const textY = useTransform(smoothY, [-300, 300], [-6, 6]);

    const bgScale = useTransform(smoothY, [-300, 300], [1, 1.04]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouseX.set(e.clientX - centerX);
            mouseY.set(e.clientY - centerY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const handleGetStarted = () => {
        if (!user) {
            navigate("/register");
            return;
        }
        if (user.role === "recruiter") {
            navigate("/recruiter/dashboard");
        } else {
            navigate("/candidate/dashboard");
        }
    };

    return (
        <section id="hero" className="relative isolate overflow-hidden bg-[#fbfbfa] pb-16 pt-28 md:pb-24 md:pt-40">
            {/* Animated slow radial glow */}
            <motion.div
                style={{ scale: bgScale }}
                animate={{
                    opacity: [0.6, 0.85, 0.6],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                aria-hidden="true"
                className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,#e9e9e5,transparent_62%)]"
            />

            <Container>
                <div className="mx-auto max-w-5xl text-center">
                    <motion.div
                        style={{ x: badgeX, y: badgeY }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-neutral-700 shadow-sm"
                    >
                        <Sparkles size={14} aria-hidden="true" /> AI-native hiring intelligence
                    </motion.div>

                    <motion.h1
                        style={{ x: titleX, y: titleY }}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-7 text-5xl font-semibold tracking-[-.055em] text-neutral-950 md:text-7xl lg:text-8xl"
                    >
                        Hire Smarter.
                        <br />
                        Recruit Faster.
                    </motion.h1>

                    <motion.p
                        style={{ x: textX, y: textY }}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-neutral-600 md:text-xl"
                    >
                        MeritConnect helps recruiters discover top talent using
                        AI-powered resume analysis, intelligent candidate
                        matching, adaptive AI interviews and streamlined hiring
                        workflows.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Button
                                size="lg"
                                onClick={handleGetStarted}
                                className="group rounded-full px-7 shadow-lg shadow-neutral-900/10"
                            >
                                {user ? "Go to Dashboard" : "Get Started"}
                                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                        </motion.div>

                        <ScrollLink
                            to="features"
                            smooth
                            offset={-80}
                            duration={500}
                        >
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full px-7"
                                >
                                    Explore Platform
                                </Button>
                            </motion.div>
                        </ScrollLink>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
