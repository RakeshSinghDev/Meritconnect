import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Container from "../../common/Container";
import Button from "../../ui/Button";

export default function CTA() {
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-28 md:py-36">
            <Container>
                <div className="relative overflow-hidden rounded-[40px] bg-neutral-950 px-8 py-20 text-center text-white md:px-16 md:py-28">
                    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,.13),transparent_42%)]" />
                    <p className="relative text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
                        Get Started
                    </p>

                    <h2 className="relative mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
                        Build the future of hiring with AI.
                    </h2>

                    <p className="relative mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300">
                        Analyze resumes, conduct AI interviews, and hire exceptional
                        candidates faster with one intelligent recruitment platform.
                    </p>

                    <div className="relative mt-12 flex justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-100"
                            onClick={() => navigate("/register")}
                        >
                            Get Started

                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
