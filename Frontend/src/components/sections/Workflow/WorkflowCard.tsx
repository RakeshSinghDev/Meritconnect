interface WorkflowCardProps {
    step: string;
    title: string;
    description: string;
}

export default function WorkflowCard({
    step,
    title,
    description,
}: WorkflowCardProps) {
    return (
        <div className="relative rounded-3xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-900/5">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                {step}
            </div>

            <h3 className="text-2xl font-semibold text-gray-900">
                {title}
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
                {description}
            </p>
        </div>
    );
}
