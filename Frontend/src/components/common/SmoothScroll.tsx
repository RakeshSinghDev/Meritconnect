import { useEffect, useState } from "react";
import Lenis from "lenis";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const smoothX = useSpring(cursorX, { stiffness: 450, damping: 35 });
    const smoothY = useSpring(cursorY, { stiffness: 450, damping: 35 });

    useEffect(() => {
        // Detect touch device / reduced motion
        const mediaQuery = window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) {
            setIsMobile(true);
            return;
        }

        // Initialize Lenis Smooth Scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 1.5,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        const rafId = requestAnimationFrame(raf);

        // Custom Cursor movement & hover detection
        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            const target = e.target as HTMLElement | null;
            if (target && target.closest("button, a, input, [role='button'], .group")) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {!isMobile && (
                <motion.div
                    style={{
                        x: smoothX,
                        y: smoothY,
                        translateX: "-50%",
                        translateY: "-50%",
                    }}
                    animate={{
                        scale: isHovered ? 2.2 : 1,
                        opacity: isHovered ? 0.25 : 0.15,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="pointer-events-none fixed top-0 left-0 z-50 h-8 w-8 rounded-full bg-neutral-900 blur-[2px] mix-blend-multiply"
                />
            )}
            {children}
        </>
    );
}
