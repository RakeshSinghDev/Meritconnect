import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Logo() {
    return (
        <Link to="/">
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
                <img
                    src="/logo.svg"
                    alt="MeritConnect Logo"
                    className="h-9 w-9 rounded-xl shadow-2xs"
                />
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-neutral-950 leading-none">
                        MeritConnect
                    </span>
                    <span className="text-[10px] font-medium text-neutral-500 tracking-wide">
                        AI Recruitment Platform
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}