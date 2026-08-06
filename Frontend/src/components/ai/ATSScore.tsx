interface ATSScoreProps {
    score: number;
}

const ATSScore = ({ score }: ATSScoreProps) => {

    const getColor = () => {
        if (score >= 85) return "text-emerald-600";
        if (score >= 70) return "text-amber-500";
        return "text-red-500";
    };

    const getStrokeColor = () => {
        if (score >= 85) return "#10B981";
        if (score >= 70) return "#F59E0B";
        return "#EF4444";
    };

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score / 100) * circumference;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        ATS Score
                    </p>

                    <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                        Applicant Tracking Score
                    </h3>
                </div>
            </div>

            <div className="flex justify-center">

                <div className="relative h-40 w-40">

                    <svg
                        className="-rotate-90 h-40 w-40"
                        viewBox="0 0 120 120"
                    >
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="#E5E7EB"
                            strokeWidth="10"
                            fill="none"
                        />

                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke={getStrokeColor()}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={progress}
                            style={{
                                transition: "stroke-dashoffset .6s ease",
                            }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">

                        <h2 className={`text-4xl font-bold ${getColor()}`}>
                            {score}%
                        </h2>

                        <span className="mt-1 text-sm text-gray-500">
                            ATS
                        </span>

                    </div>

                </div>

            </div>

            <div className="mt-8 rounded-xl bg-gray-50 p-4">

                <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                        Resume Parsing
                    </span>

                    <span className="font-semibold text-gray-900">
                        Excellent
                    </span>

                </div>

                <div className="mt-3 flex justify-between text-sm">

                    <span className="text-gray-500">
                        Keywords
                    </span>

                    <span className="font-semibold text-gray-900">
                        Optimized
                    </span>

                </div>

                <div className="mt-3 flex justify-between text-sm">

                    <span className="text-gray-500">
                        Formatting
                    </span>

                    <span className="font-semibold text-gray-900">
                        ATS Friendly
                    </span>

                </div>

            </div>

        </div>
    );
};

export default ATSScore;