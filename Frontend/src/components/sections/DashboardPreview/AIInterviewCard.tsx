import { Bot } from "lucide-react";

const interviewMetrics = [
    {
        label: "Technical Assessment",
        value: "92%",
    },
    {
        label: "Communication",
        value: "89%",
    },
    {
        label: "Problem Solving",
        value: "94%",
    },
    {
        label: "Confidence",
        value: "91%",
    },
];

export default function AIInterviewCard() {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                    <Bot size={22} />
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        AI Interview Insights
                    </h3>

                    <p className="text-sm text-gray-500">
                        Automated interview evaluation
                    </p>
                </div>
            </div>

            <div className="mt-8 space-y-5">
                {interviewMetrics.map((item) => (
                    <div key={item.label}>
                        <div className="mb-2 flex justify-between">
                            <span className="text-sm text-gray-600">
                                {item.label}
                            </span>

                            <span className="font-semibold">
                                {item.value}
                            </span>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-black"
                                style={{
                                    width: item.value,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}