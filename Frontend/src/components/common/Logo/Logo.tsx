import { Link } from "react-router-dom";

export default function Logo() {
    return (
        <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white">
                M
            </div>

            <span className="text-xl font-semibold tracking-tight text-gray-900">
                MeritConnect
            </span>
        </Link>
    );
}