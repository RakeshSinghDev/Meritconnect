import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FAQItemProps {
    question: string;
    answer: string;
}

export default function FAQItem({
    question,
    answer,
}: FAQItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-3xl border border-gray-200 bg-white transition-all">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <h3 className="text-lg font-semibold text-gray-900">
                    {question}
                </h3>

                <ChevronDown
                    className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence initial={false}>{open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} className="overflow-hidden px-6 pb-6">
                    <p className="leading-7 text-gray-600">
                        {answer}
                    </p>
                </motion.div>
            )}</AnimatePresence>
        </div>
    );
}
