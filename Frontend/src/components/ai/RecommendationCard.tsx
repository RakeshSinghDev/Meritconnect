import {
    CheckCircle,
    CircleDashed,
    XCircle,
    Star,
} from "lucide-react";

interface RecommendationCardProps {
    recommendation: string;
    confidence?: number;
}

const RecommendationCard = ({
    recommendation,
    confidence = 0,
}: RecommendationCardProps) => {
    const colors = {
        emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
        blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "bg-blue-500", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
        amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
        red: { bg: "bg-red-50", border: "border-red-200", icon: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700" },
    } as const;

    const config = {
        "Strong Hire": {
            icon: CheckCircle,
            color: "emerald",
            title: "Strong Hire",
            description:
                "Excellent alignment with the job requirements. Highly recommended for the next hiring stage.",
        },
        Hire: {
            icon: Star,
            color: "blue",
            title: "Hire",
            description:
                "Good technical match with only minor skill gaps. Suitable for interview.",
        },
        Consider: {
            icon: CircleDashed,
            color: "amber",
            title: "Consider",
            description:
                "Candidate meets some requirements but has noticeable skill gaps.",
        },
        Reject: {
            icon: XCircle,
            color: "red",
            title: "Reject",
            description:
                "Current profile does not sufficiently match the job requirements.",
        },
    } as const;

    const normalizedRec = (recommendation || "").toLowerCase();
    let key: keyof typeof config = "Consider";

    if (normalizedRec.includes("strong")) {
        key = "Strong Hire";
    } else if (normalizedRec.includes("hire") && !normalizedRec.includes("no") && !normalizedRec.includes("not")) {
        key = "Hire";
    } else if (normalizedRec.includes("reject") || normalizedRec.includes("no hire")) {
        key = "Reject";
    } else if (recommendation in config) {
        key = recommendation as keyof typeof config;
    }

    const current = config[key] || config["Consider"];
    const Icon = current.icon;
    const theme = colors[current.color];

    return (
        <div
            className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-sm`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${theme.icon}`}
                    >
                        <Icon
                            className="text-white"
                            size={28}
                        />
                    </div>

                    <div>
                        <h3
                            className={`text-xl font-bold ${theme.text}`}
                        >
                            {current.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            {current.description}
                        </p>
                    </div>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${theme.badge}`}
                >
                    {recommendation || current.title}
                </span>
            </div>

            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        AI Confidence
                    </span>

                    <span className="font-semibold text-gray-900">
                        {confidence}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className={theme.icon}
                        style={{
                            width: `${confidence}%`,
                            height: "100%",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
