interface Props {
    score: number;
}

const CandidateScore = ({ score }: Props) => {
    let color = "bg-red-500";

    if (score >= 80) {
        color = "bg-green-500";
    } else if (score >= 60) {
        color = "bg-yellow-500";
    }

    return (
        <div className="flex items-center gap-3">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full ${color}`}
                    style={{
                        width: `${score}%`,
                    }}
                />
            </div>

            <span className="text-sm font-semibold">
                {score}%
            </span>
        </div>
    );
};

export default CandidateScore;