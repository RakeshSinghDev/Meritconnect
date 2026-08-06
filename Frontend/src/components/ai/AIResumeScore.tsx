interface AIResumeScoreProps {
    score: number;
}

const AIResumeScore = ({ score }: AIResumeScoreProps) => {
    const getColor = () => {
        if (score >= 85) return "bg-emerald-500";
        if (score >= 70) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getTextColor = () => {
        if (score >= 85) return "text-emerald-600";
        if (score >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">
                        Resume Match
                    </p>

                    <h2 className={`mt-2 text-5xl font-bold ${getTextColor()}`}>
                        {score}%
                    </h2>
                </div>

                <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${getColor()}`}
                >
                    {score}
                </div>

            </div>

            <div className="mt-8 h-3 overflow-hidden rounded-full bg-gray-200">

                <div
                    className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
                    style={{
                        width: `${score}%`,
                    }}
                />

            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Low Match</span>
                <span>Excellent Match</span>
            </div>

        </div>
    );
};

export default AIResumeScore;
