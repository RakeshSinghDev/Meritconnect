import Container from "../../common/Container";
import DashboardStats from "./DashboardStats";
import ResumeAnalysisCard from "./ResumeAnalysisCard";
import AIInterviewCard from "./AIInterviewCard";


export default function DashboardPreview() {
    return (
        <section id="dashboard" className="bg-gray-50 py-32">
            <Container>
                <div className="mx-auto max-w-3xl text-center">

                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                        Dashboard
                    </p>

                    <h2 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900">
                        AI-powered recruitment at a glance
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Monitor candidates, applications, interviews, and hiring
                        performance from one intelligent dashboard.
                    </p>

                </div>

                <div className="mt-20">
                    <DashboardStats />

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">

                        <ResumeAnalysisCard />
                        <AIInterviewCard />
                    </div>
                </div>
            </Container>
        </section>
    );
}
