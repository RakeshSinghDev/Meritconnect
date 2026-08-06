interface Props {
    status: "Active" | "Closed";
}

const JobStatusBadge = ({ status }: Props) => {

    const styles =
        status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600";

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
        >
            {status}
        </span>
    );
};

export default JobStatusBadge;