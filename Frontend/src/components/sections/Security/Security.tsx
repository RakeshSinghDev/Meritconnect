import Container from "../../common/Container";
import SecurityCard from "./SecurityCard";

import {
    ShieldCheck,
    Lock,
    KeyRound,
    Database,
} from "lucide-react";

const security = [
    {
        icon: <Lock size={26} />,
        title: "Data Encryption",
        description:
            "Candidate information is encrypted during storage and transmission to help protect sensitive recruitment data.",
    },
    {
        icon: <KeyRound size={26} />,
        title: "Role-Based Access",
        description:
            "Recruiters, HR managers, and administrators can securely access only the information relevant to their roles.",
    },
    {
        icon: <Database size={26} />,
        title: "Secure Infrastructure",
        description:
            "Designed with modern cloud architecture, regular backups, and reliable performance for recruitment workflows.",
    },
    {
        icon: <ShieldCheck size={26} />,
        title: "Privacy First",
        description:
            "Built with privacy-focused practices to support responsible handling of candidate and recruiter information.",
    },
];

export default function Security() {
    return (
        <section id="security" className="bg-neutral-950 py-28 text-white md:py-36">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
                        Security
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                        Enterprise-grade security for modern hiring
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-neutral-400">
                        Protect candidate information with secure access controls,
                        encrypted data handling, and privacy-focused recruitment
                        workflows.
                    </p>
                </div>

                <div className="mt-20 grid gap-8 md:grid-cols-2">
                    {security.map((item) => (
                        <SecurityCard
                            key={item.title}
                            {...item}
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
}
