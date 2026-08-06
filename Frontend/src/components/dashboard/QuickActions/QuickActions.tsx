import {
    BriefcaseBusiness,
    FileText,
    Bot,
    Plus,
} from "lucide-react";

const actions = [
    {
        title: "Create Job",
        icon: Plus,
    },
    {
        title: "Jobs",
        icon: BriefcaseBusiness,
    },
    {
        title: "Applications",
        icon: FileText,
    },
    {
        title: "AI Interviews",
        icon: Bot,
    },
];

const QuickActions = () => {
    return (
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {actions.map((item) => {

                const Icon = item.icon;

                return (

                    <button
                        key={item.title}
                        className="rounded-3xl border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="mb-4 inline-flex rounded-2xl bg-gray-100 p-3">
                            <Icon size={22} />
                        </div>

                        <h3 className="font-semibold">
                            {item.title}
                        </h3>

                    </button>

                );

            })}

        </div>
    );
};

export default QuickActions;