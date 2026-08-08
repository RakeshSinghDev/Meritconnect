import { motion } from "framer-motion";
import Container from "../../common/Container";

const companies = [
    "Google",
    "Microsoft",
    "OpenAI",
    "Amazon",
    "Netflix",
    "Adobe",
];

export default function Companies() {
    return (
        <section id="companies" className="overflow-hidden border-y border-neutral-200 bg-white py-14">
            <Container>
                <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-500">
                        Trusted by innovative companies
                    </p>

                    <div className="relative mt-9 overflow-hidden">
                        <motion.div
                            className="flex w-max gap-4"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                duration: 25,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                            whileHover={{ animationPlayState: "paused" }}
                        >
                            {[...companies, ...companies, ...companies, ...companies].map((company, index) => (
                                <motion.div
                                    key={`${company}-${index}`}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="flex h-14 w-40 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-base font-semibold text-neutral-400 grayscale transition hover:border-neutral-400 hover:bg-white hover:text-neutral-900 hover:grayscale-0 shadow-2xs"
                                >
                                    {company}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
