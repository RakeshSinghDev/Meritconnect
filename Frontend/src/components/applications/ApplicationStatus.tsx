interface Props {
    status:
    | "Applied"
    | "Pending"
    | "Reviewed"
    | "Shortlisted"
    | "Interview"
    | "Hired"
    | "Rejected";
}

const statusStyles = {
    Applied:
        "bg-gray-100 text-gray-700",

    Pending:
        "bg-yellow-100 text-yellow-700",

    Reviewed:
        "bg-blue-100 text-blue-700",

    Shortlisted:
        "bg-green-100 text-green-700",

    Interview:
        "bg-purple-100 text-purple-700",

    Hired:
        "bg-emerald-100 text-emerald-700",

    Rejected:
        "bg-red-100 text-red-700",
} satisfies Record<Props["status"], string>;

const ApplicationStatus = ({ status }: Props) => {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
};

export default ApplicationStatus;