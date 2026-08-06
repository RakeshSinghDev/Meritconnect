interface Props {
    title: string;
    description: string;
}

const EmptyState = ({ title, description }: Props) => {
    return (
        <div className="flex h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-center">

            <h3 className="text-lg font-semibold">
                {title}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
                {description}
            </p>

        </div>
    );
};

export default EmptyState;