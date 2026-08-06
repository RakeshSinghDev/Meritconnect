import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";

import Container from "../../common/Container/Container";
import Logo from "../../common/Logo/Logo";
import Button from "../../ui/Button";

export default function Navbar() {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const update = () => setScrolled(window.scrollY > 12);
        update(); window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all ${scrolled ? "border-neutral-200/80 bg-white/90 shadow-sm" : "border-transparent bg-white/70"}`}>

            <Container>

                <div className={`flex items-center justify-between transition-all ${scrolled ? "h-16" : "h-20"}`}>

                    {/* Logo */}

                    <Logo />

                    {/* Desktop Navigation */}

                    <nav className="hidden items-center gap-10 md:flex">

                        <ScrollLink
                            to="features"
                            smooth
                            offset={-80}
                            duration={500}
                            spy
                            activeClass="text-black"
                            className="cursor-pointer text-sm font-medium text-gray-600 transition hover:text-black focus:outline-none focus-visible:text-black"
                        >
                            Features
                        </ScrollLink>

                        <ScrollLink
                            to="companies"
                            smooth
                            offset={-80}
                            duration={500}
                            spy
                            activeClass="text-black"
                            className="cursor-pointer text-sm font-medium text-gray-600 transition hover:text-black focus:outline-none focus-visible:text-black"
                        >
                            Companies
                        </ScrollLink>

                        <ScrollLink
                            to="pricing"
                            smooth
                            offset={-80}
                            duration={500}
                            spy
                            activeClass="text-black"
                            className="cursor-pointer text-sm font-medium text-gray-600 transition hover:text-black focus:outline-none focus-visible:text-black"
                        >
                            Pricing
                        </ScrollLink>

                        <ScrollLink
                            to="footer"
                            smooth
                            offset={-80}
                            duration={500}
                            spy
                            activeClass="text-black"
                            className="cursor-pointer text-sm font-medium text-gray-600 transition hover:text-black focus:outline-none focus-visible:text-black"
                        >
                            Contact
                        </ScrollLink>

                    </nav>

                    {/* Desktop Buttons */}

                    <div className="hidden items-center gap-4 md:flex">

                        <Button
                            variant="ghost"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>

                        <Button
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Get Started
                        </Button>

                    </div>

                    {/* Mobile Menu Button */}

                    <button
                        onClick={() =>
                            setMobileMenuOpen(
                                (prev) => !prev
                            )
                        }
                        className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                    >

                        {mobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}

                    </button>

                </div>

            </Container>

            {/* Mobile Menu */}

            <AnimatePresence>{mobileMenuOpen && (

                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-gray-200 bg-white shadow-lg md:hidden">

                    <div className="flex flex-col gap-1 px-6 py-6">

                        <ScrollLink
                            to="features"
                            smooth
                            offset={-80}
                            duration={500}
                            onClick={closeMobileMenu}
                            className="cursor-pointer rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                        >
                            Features
                        </ScrollLink>

                        <ScrollLink
                            to="companies"
                            smooth
                            offset={-80}
                            duration={500}
                            onClick={closeMobileMenu}
                            className="cursor-pointer rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                        >
                            Companies
                        </ScrollLink>

                        <ScrollLink
                            to="pricing"
                            smooth
                            offset={-80}
                            duration={500}
                            onClick={closeMobileMenu}
                            className="cursor-pointer rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                        >
                            Pricing
                        </ScrollLink>

                        <ScrollLink
                            to="footer"
                            smooth
                            offset={-80}
                            duration={500}
                            onClick={closeMobileMenu}
                            className="cursor-pointer rounded-lg px-3 py-3 text-gray-700 transition hover:bg-gray-100"
                        >
                            Contact
                        </ScrollLink>

                        <div className="mt-5 flex flex-col gap-3">

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    closeMobileMenu();
                                    navigate("/login");
                                }}
                            >
                                Login
                            </Button>

                            <Button
                                className="w-full"
                                onClick={() => {
                                    closeMobileMenu();
                                    navigate("/register");
                                }}
                            >
                                Get Started
                            </Button>

                        </div>

                    </div>

                </motion.div>

            )}</AnimatePresence>

        </header>
    );
}
