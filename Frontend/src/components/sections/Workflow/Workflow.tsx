import Container from "../../common/Container";
import WorkflowCard from "./WorkflowCard";

const steps = [
    {
        step: "01",
        title: "Create Job",
        description: "Post a job with required skills and experience.",
    },
    {
        step: "02",
        title: "AI Resume Analysis",
        description: "AI analyzes resumes and generates candidate scores.",
    },
    {
        step: "03",
        title: "Smart Matching",
        description: "Candidates are ranked by skills and job relevance.",
    },
    {
        step: "04",
        title: "AI Interview",
        description: "AI conducts adaptive interviews and evaluates responses.",
    },
    {
        step: "05",
        title: "Final Hiring",
        description: "Review AI insights and make the final hiring decision.",
    },
];

export default function Workflow() {
    return (
        <section id="workflow" className="bg-neutral-50 py-28 md:py-36">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                        Workflow
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold tracking-tight">
                        Hiring, with momentum at every step
                    </h2>

                    <p className="mt-6 text-lg text-gray-600">
                        Our AI streamlines recruitment so you can focus on hiring the best
                        talent instead of sorting through resumes manually.
                    </p>
                </div>

                <div className="relative mt-20 grid gap-4 lg:grid-cols-5 lg:gap-5">
                    {steps.map((item) => (
                        <WorkflowCard key={item.step} {...item} />
                    ))}
                </div>
            </Container>
        </section>
    );
}
