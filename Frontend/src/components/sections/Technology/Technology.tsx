import Container from "../../common/Container";
import TechnologyCard from "./TechnologyCard";

import {
    BrainCircuit,
    ScanSearch,
    Bot,
    ShieldCheck,
} from "lucide-react";

const technologies = [
    {
        icon: <BrainCircuit />,
        title: "Resume Intelligence",
        description:
            "Extracts candidate skills, experience, education, certifications, and projects using AI-powered parsing.",
    },
    {
        icon: <ScanSearch />,
        title: "Semantic Matching",
        description:
            "Ranks candidates by understanding context and job relevance instead of relying only on keyword matching.",
    },
    {
        icon: <Bot />,
        title: "AI Interview Agent",
        description:
            "Conducts adaptive interviews based on resumes and job descriptions while generating detailed evaluation reports.",
    },
    {
        icon: <ShieldCheck />,
        title: "Secure by Design",
        description:
            "Role-based access, encrypted candidate data, and privacy-focused architecture built for modern recruitment.",
    },
];

export default function Technology() {
    return (
        <section id="technology" className="bg-gray-50 py-32">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                        Technology
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                        AI powering every hiring decision
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        MeritConnect combines artificial intelligence with modern recruitment
                        workflows to help recruiters identify the right candidates faster and
                        with greater confidence.
                    </p>
                </div>

                <div className="mt-20 grid gap-8 md:grid-cols-2">
                    {technologies.map((item) => (
                        <TechnologyCard
                            key={item.title}
                            {...item}
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
}
