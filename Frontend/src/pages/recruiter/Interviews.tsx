import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    Search,
    Video,
    MapPin,
    XCircle,
} from "lucide-react";

import {
    cancelInterview,
    getRecruiterInterviews,
} from "../../services/interview.service";

import type { Interview } from "../../types/interview";

const Interviews = () => {

    const [interviews, setInterviews] =
        useState<Interview[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const loadInterviews = async () => {

        try {

            setLoading(true);

            const data =
                await getRecruiterInterviews();

            setInterviews(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadInterviews();

    }, []);

    const filteredInterviews =
        useMemo(() => {

            return interviews.filter((item) => {

                const matchesSearch =

                    item.candidate.name
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        ) ||

                    item.job.title
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );

                const matchesStatus =

                    statusFilter === "All"

                        ? true

                        : item.status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            });

        }, [
            interviews,
            search,
            statusFilter,
        ]);

    const handleCancel =
        async (id: string) => {

            if (
                !confirm(
                    "Cancel this interview?"
                )
            ) {
                return;
            }

            try {

                await cancelInterview(id);

                await loadInterviews();

            } catch (err) {

                console.error(err);

                alert(
                    "Unable to cancel interview."
                );

            }

        };

    if (loading) {

        return (

            <div className="flex h-80 items-center justify-center">

                <div className="text-lg font-medium">

                    Loading Interviews...

                </div>

            </div>

        );

    }

    return (

        <div className="space-y-8">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-4xl font-bold">

                        Interviews

                    </h1>

                    <p className="mt-2 text-gray-500">

                        Manage every scheduled interview.

                    </p>

                </div>

            </div>

            {/* Filters */}

            <div className="flex flex-col gap-4 md:flex-row">

                <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search candidate or job..."
                        className="h-12 w-full rounded-xl border border-gray-200 pl-11"
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    className="h-12 rounded-xl border border-gray-200 px-4"
                >

                    <option>
                        All
                    </option>

                    <option>
                        Scheduled
                    </option>

                    <option>
                        Completed
                    </option>

                    <option>
                        Cancelled
                    </option>

                </select>

            </div>

            {/* Empty */}

            {filteredInterviews.length ===
                0 && (

                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">

                        <Calendar
                            className="mx-auto mb-4 text-gray-400"
                            size={50}
                        />

                        <h2 className="text-2xl font-semibold">

                            No Interviews Found

                        </h2>

                        <p className="mt-2 text-gray-500">

                            Interviews will appear here.

                        </p>

                    </div>

                )}
            {/* Interview List */}

            {filteredInterviews.length > 0 && (

                <div className="grid gap-6">

                    {filteredInterviews.map(
                        (interview) => (

                            <div
                                key={interview._id}
                                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                            >

                                <div className="flex flex-col justify-between gap-6 lg:flex-row">

                                    {/* Left */}

                                    <div className="space-y-5">

                                        <div>

                                            <h2 className="text-2xl font-semibold">

                                                {interview.candidate.name}

                                            </h2>

                                            <p className="mt-1 text-gray-500">

                                                {interview.job.title}

                                            </p>

                                            <p className="text-sm text-gray-400">

                                                {interview.job.company}

                                            </p>

                                        </div>

                                        <div className="flex flex-wrap gap-5 text-sm text-gray-600">

                                            <span className="flex items-center gap-2">

                                                <Calendar size={16} />

                                                {new Date(
                                                    interview.interviewDate
                                                ).toLocaleDateString()}

                                            </span>

                                            <span className="flex items-center gap-2">

                                                <Clock size={16} />

                                                {new Date(
                                                    interview.interviewDate
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}

                                            </span>

                                            <span>

                                                {interview.duration} mins

                                            </span>

                                        </div>

                                        <div className="flex flex-wrap gap-3">

                                            <span
                                                className={`rounded-full px-4 py-2 text-sm font-medium ${interview.mode === "Online"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >

                                                {interview.mode}

                                            </span>

                                            <span
                                                className={`rounded-full px-4 py-2 text-sm font-medium ${interview.status === "Scheduled"
                                                        ? "bg-green-100 text-green-700"
                                                        : interview.status ===
                                                            "Completed"
                                                            ? "bg-indigo-100 text-indigo-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                            >

                                                {interview.status}

                                            </span>

                                        </div>

                                    </div>

                                    {/* Right */}

                                    <div className="flex flex-col gap-3">

                                        {interview.mode ===
                                            "Online" &&
                                            interview.meetingLink && (

                                                <a
                                                    href={
                                                        interview.meetingLink
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-white transition hover:bg-gray-800"
                                                >

                                                    <Video size={18} />

                                                    Join Meeting

                                                </a>

                                            )}

                                        {interview.mode ===
                                            "Offline" &&
                                            interview.venue && (

                                                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3">

                                                    <MapPin size={18} />

                                                    <span>

                                                        {
                                                            interview.venue
                                                        }

                                                    </span>

                                                </div>

                                            )}

                                        <button
                                            onClick={() =>
                                                handleCancel(
                                                    interview._id
                                                )
                                            }
                                            disabled={
                                                interview.status !==
                                                "Scheduled"
                                            }
                                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <XCircle
                                                size={18}
                                            />

                                            Cancel Interview

                                        </button>

                                    </div>

                                </div>

                                {interview.notes && (

                                    <div className="mt-6 rounded-xl bg-gray-50 p-4">

                                        <h4 className="mb-2 font-semibold">

                                            Notes

                                        </h4>

                                        <p className="text-gray-600">

                                            {interview.notes}

                                        </p>

                                    </div>

                                )}

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );

};

export default Interviews;