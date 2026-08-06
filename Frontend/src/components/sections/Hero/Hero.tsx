import { useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import Container from "../../common/Container";
import Button from "../../ui/Button";

import { useAuth } from "../../../store/AuthContext";

export default function Hero() {

    const navigate = useNavigate();

    const { user } = useAuth();

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

        <section id="hero" className="relative isolate overflow-hidden bg-[#fbfbfa] pb-24 pt-28 md:pb-32 md:pt-40">

            <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,#e9e9e5,transparent_62%)]" />

            <Container>

                <div className="mx-auto max-w-5xl text-center">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-neutral-700 shadow-sm">
                        <Sparkles size={14} aria-hidden="true" /> AI-native hiring intelligence
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .08 }} className="mt-7 text-5xl font-semibold tracking-[-.055em] text-neutral-950 md:text-7xl lg:text-8xl">

                        Hire Smarter.

                        <br />

                        Recruit Faster.

                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .16 }} className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-neutral-600 md:text-xl">

                        MeritConnect helps recruiters discover top talent using
                        AI-powered resume analysis, intelligent candidate
                        matching, adaptive AI interviews and streamlined hiring
                        workflows.

                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .24 }} className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">

                        <Button
                            size="lg"
                            onClick={handleGetStarted}
                            className="group rounded-full px-7 shadow-lg shadow-neutral-900/10 hover:scale-[1.02] active:scale-[.98]"
                        >
                            {user
                                ? "Go to Dashboard"
                                : "Get Started"}
                            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>

                        <ScrollLink
                            to="features"
                            smooth
                            offset={-80}
                            duration={500}
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full px-7 hover:scale-[1.02] active:scale-[.98]"
                            >
                                Explore Platform
                            </Button>
                        </ScrollLink>

                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .32 }} className="mx-auto mt-20 max-w-5xl rounded-[2rem] border border-neutral-200 bg-white p-3 shadow-[0_30px_90px_-45px_rgba(0,0,0,.35)]">
                        <div className="grid gap-3 rounded-[1.5rem] bg-neutral-950 p-5 text-left text-white md:grid-cols-[1.25fr_.75fr] md:p-8">
                            <div><p className="text-sm text-neutral-400">Hiring pipeline</p><div className="mt-6 space-y-3">{["Priya Shah · 96% match","Noah Williams · 92% match","Emma Chen · 89% match"].map((item) => <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.06] px-4 py-3"><span>{item}</span><span className="text-xs text-emerald-300">Shortlisted</span></div>)}</div></div>
                            <div className="rounded-2xl bg-white p-5 text-neutral-950"><p className="text-sm font-medium text-neutral-500">AI recommendation</p><p className="mt-8 text-4xl font-semibold tracking-tight">Strong hire</p><div className="mt-5 h-2 rounded-full bg-neutral-100"><div className="h-full w-[94%] rounded-full bg-neutral-950" /></div><p className="mt-3 text-sm text-neutral-500">94% overall fit</p></div>
                        </div>
                    </motion.div>

                </div>

            </Container>

        </section>

    );

}
