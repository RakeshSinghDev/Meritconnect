import { Brain, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

interface AISummaryProps {
    summary: string;
    strengths?: string[];
    improvements?: string[];
}

const AISummary = ({
    summary,
    strengths = [],
    improvements = [],
}: AISummaryProps) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Header */}
            <div className="border-b border-gray-100 p-6">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                        <Brain
                            size={24}
                            className="text-violet-600"
                        />
                    </div>

                    <div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            AI Resume Summary
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Automatically generated candidate insights.
                        </p>

                    </div>

                </div>

            </div>

            {/* Summary */}
            <div className="p-6">

                <div className="rounded-xl bg-gray-50 p-5">

                    <div className="mb-3 flex items-center gap-2">

                        <Sparkles
                            size={18}
                            className="text-violet-600"
                        />

                        <h3 className="font-semibold text-gray-900">
                            Executive Summary
                        </h3>

                    </div>

                    <p className="leading-7 text-gray-700">
                        {summary}
                    </p>

                </div>

                {/* Strengths */}

                {strengths.length > 0 && (
                    <div className="mt-6">

                        <div className="mb-4 flex items-center gap-2">

                            <TrendingUp
                                size={18}
                                className="text-emerald-600"
                            />

                            <h3 className="font-semibold text-gray-900">
                                Key Strengths
                            </h3>

                        </div>

                        <div className="space-y-3">

                            {strengths.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4"
                                >
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                                    <p className="text-gray-700">
                                        {item}
                                    </p>

                                </div>
                            ))}

                        </div>

                    </div>
                )}

                {/* Improvements */}

                {improvements.length > 0 && (
                    <div className="mt-8">

                        <div className="mb-4 flex items-center gap-2">

                            <AlertTriangle
                                size={18}
                                className="text-amber-600"
                            />

                            <h3 className="font-semibold text-gray-900">
                                Improvement Areas
                            </h3>

                        </div>

                        <div className="space-y-3">

                            {improvements.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-xl bg-amber-50 p-4"
                                >
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />

                                    <p className="text-gray-700">
                                        {item}
                                    </p>

                                </div>
                            ))}

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
};

export default AISummary;