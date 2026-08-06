interface Props {
    status:
    | "Pending"
    | "Reviewed"
    | "Shortlisted"
    | "Rejected";
}

const statusStyles = {
    Pending:
        "bg-yellow-100 text-yellow-700",

    Reviewed:
        "bg-blue-100 text-blue-700",

    Shortlisted:
        "bg-green-100 text-green-700",

    Rejected:
        "bg-red-100 text-red-700",
};

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