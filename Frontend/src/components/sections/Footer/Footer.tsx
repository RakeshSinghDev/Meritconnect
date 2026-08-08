import {
    FaGithub,
    FaLinkedin,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

import Container from "../../common/Container";

export default function Footer() {
    const productLinks = [
        { label: "Features", target: "features" },
        { label: "AI Workflow", target: "workflow" },
        { label: "Dashboard", target: "dashboard" },
        { label: "Security", target: "security" },
    ];

    return (
        <footer id="footer" className="border-t border-gray-200 bg-white">
            <Container>
                <div className="grid gap-16 py-20 lg:grid-cols-5">

                    {/* Brand */}

                    <div className="lg:col-span-2">

                        <Link
                            to="/"
                            className="text-3xl font-bold tracking-tight text-gray-900"
                        >
                            MeritConnect
                        </Link>

                        <p className="mt-6 max-w-md leading-7 text-gray-600">
                            AI-powered recruitment platform helping recruiters discover,
                            evaluate, and hire exceptional talent with confidence.
                        </p>

                        <div className="mt-8 flex gap-4">

                            <a
                                href="https://github.com/RakeshSinghDev"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="MeritConnect on GitHub"
                                className="rounded-xl border border-gray-200 p-3 transition hover:bg-gray-100"
                            >
                                <FaGithub size={20} />
                            </a>

                            <a
                                href="https://www.linkedin.com/in/rakesh-kumar-singh-27a70324a"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="MeritConnect on LinkedIn"
                                className="rounded-xl border border-gray-200 p-3 transition hover:bg-gray-100"
                            >
                                <FaLinkedin size={20} />
                            </a>

                        </div>
                    </div>

                    {/* Product */}

                    <div>

                        <h3 className="font-semibold text-gray-900">
                            Product
                        </h3>

                        <div className="mt-5 space-y-4">
                            {productLinks.map((item) => (
                                <ScrollLink
                                    key={item.target}
                                    to={item.target}
                                    smooth
                                    offset={-80}
                                    duration={500}
                                    className="block text-gray-600 transition hover:text-black"
                                >
                                    {item.label}
                                </ScrollLink>
                            ))}
                        </div>

                    </div>

                    {/* Company */}

                    <div>

                        <h3 className="font-semibold text-gray-900">
                            Company
                        </h3>

                        <div className="mt-5 space-y-4">
                            <ScrollLink to="hero" smooth offset={-80} duration={500} className="block cursor-pointer text-gray-600 transition hover:text-black">About</ScrollLink>
                            <a href="mailto:rssingh0246@gmail.com" className="block text-gray-600 transition hover:text-black">Contact</a>
                            <a href="mailto:rssingh0246@gmail.com?subject=Careers%20at%20MeritConnect" className="block text-gray-600 transition hover:text-black">Careers</a>
                        </div>

                    </div>

                    {/* Resources */}

                    <div>

                        <h3 className="font-semibold text-gray-900">
                            Resources
                        </h3>

                        <div className="mt-5 space-y-4">
                            <ScrollLink to="faq" smooth offset={-80} duration={500} className="block cursor-pointer text-gray-600 transition hover:text-black">FAQ</ScrollLink>
                            <a href="mailto:rssingh0246@gmail.com" className="block text-gray-600 transition hover:text-black">rssingh0246@gmail.com</a>
                            <a href="tel:+916201218247" className="block text-gray-600 transition hover:text-black">+91 6201218247</a>
                        </div>

                    </div>

                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-8 text-sm text-gray-500 md:flex-row">
                    <p>© {new Date().getFullYear()} MeritConnect. All rights reserved.</p>

                    <p>Built for modern AI-powered recruitment.</p>
                </div>
            </Container>
        </footer>
    );
}
