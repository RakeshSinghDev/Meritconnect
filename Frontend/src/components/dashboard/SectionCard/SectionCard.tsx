import type { ReactNode } from "react";

interface Props {
    title: string;
    children: ReactNode;
}

const SectionCard = ({ title, children }: Props) => {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold">
                {title}
            </h2>

            {children}

        </div>
    );
};

export default SectionCard;