import Container from "../../common/Container";
import FAQItem from "./FAQItem";

const faqs = [
    {
        question: "How does AI resume analysis work?",
        answer:
            "MeritConnect analyzes resumes by identifying skills, experience, education, certifications, and projects to generate intelligent candidate insights.",
    },
    {
        question: "Can recruiters customize AI interviews?",
        answer:
            "Yes. Recruiters can define interview objectives, while the AI adapts questions based on the job description and candidate profile.",
    },
    {
        question: "Is candidate data secure?",
        answer:
            "Yes. MeritConnect is designed with encrypted data handling, secure authentication, and role-based access controls.",
    },
    {
        question: "Can I manage the entire hiring process in one place?",
        answer:
            "Yes. From job posting and resume screening to AI interviews and hiring decisions, MeritConnect brings the recruitment workflow into one platform.",
    },
];
export default function FAQ() {
    return (
        <section id="faq" className="py-28 bg-white md:py-36">
            <Container>
                <div className="mx-auto max-w-3xl text-center">

                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                        FAQ
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                        Frequently Asked Questions
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Everything you need to know about MeritConnect.
                    </p>

                </div>

                <div className="mx-auto mt-16 max-w-4xl space-y-5">
                    {faqs.map((faq) => (
                        <FAQItem
                            key={faq.question}
                            {...faq}
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
}
