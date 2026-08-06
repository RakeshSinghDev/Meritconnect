import { useEffect, useRef, useState } from "react";
import {
    Bell,
    ChevronDown,
    Menu,
    Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { socket } from "../../../lib/socket";

import { useAuth } from "../../../store/AuthContext";

import useDebounce from "../../../hooks/useDebounce";

import {
    searchJobs,
} from "../../../services/search.service";

import {
    getUnreadCount,
} from "../../../services/notification.service";

import type { SearchJob } from "../../../types/search";

import NotificationDropdown from ".././NotificationDropdown";
import ProfileDropdown from ".././ProfileDropdown";

interface SocketNotification {
    _id: string;
    title: string;
    message: string;
}

const Topbar = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    // ==========================
    // Notification State
    // ==========================

    const [unread, setUnread] =
        useState(0);

    const [
        showNotifications,
        setShowNotifications,
    ] = useState(false);

    // ==========================
    // Profile State
    // ==========================

    const [
        showProfile,
        setShowProfile,
    ] = useState(false);

    // ==========================
    // Search State
    // ==========================

    const [search, setSearch] =
        useState("");

    const [
        searchResults,
        setSearchResults,
    ] = useState<SearchJob[]>([]);

    const [
        searchLoading,
        setSearchLoading,
    ] = useState(false);

    const [
        showSearch,
        setShowSearch,
    ] = useState(false);

    const debouncedSearch =
        useDebounce(search, 400);

    // ==========================
    // Refs
    // ==========================

    const notificationRef =
        useRef<HTMLDivElement>(null);

    const profileRef =
        useRef<HTMLDivElement>(null);

    const searchRef =
        useRef<HTMLDivElement>(null);

    // ==========================
    // Initial Unread Count
    // ==========================

    useEffect(() => {

        const loadUnread =
            async () => {

                try {

                    const count =
                        await getUnreadCount();

                    setUnread(count);

                } catch (error) {

                    console.error(error);

                }

            };

        loadUnread();

    }, []);

    // ==========================
    // Live Socket Notifications
    // ==========================

    useEffect(() => {

        const handleNotification = (
            notification: SocketNotification
        ) => {

            setUnread((prev) => prev + 1);

            toast.success(notification.title);

        };

        socket.on(
            "notification",
            handleNotification
        );

        return () => {

            socket.off(
                "notification",
                handleNotification
            );

        };

    }, []);

    // ==========================
    // Search Jobs
    // ==========================

    useEffect(() => {

        const loadSearch =
            async () => {

                if (
                    !debouncedSearch.trim()
                ) {

                    setSearchResults([]);

                    return;

                }

                try {

                    setSearchLoading(
                        true
                    );

                    const jobs =
                        await searchJobs(
                            debouncedSearch
                        );

                    setSearchResults(
                        jobs
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                } finally {

                    setSearchLoading(
                        false
                    );

                }

            };

        loadSearch();

    }, [debouncedSearch]);

    // ==========================
    // Outside Click
    // ==========================

    useEffect(() => {

        const handleClickOutside = (
            event: MouseEvent
        ) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target as Node
                )
            ) {

                setShowNotifications(
                    false
                );

            }

            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node
                )
            ) {

                setShowProfile(
                    false
                );

            }

            if (
                searchRef.current &&
                !searchRef.current.contains(
                    event.target as Node
                )
            ) {

                setShowSearch(
                    false
                );

            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);
    return (

        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

            {/* ================= LEFT ================= */}

            <div className="flex items-center gap-4">

                {/* Mobile Menu */}

                <button className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 lg:hidden">

                    <Menu size={20} />

                </button>

                {/* Search */}

                <div
                    ref={searchRef}
                    className="relative hidden md:block"
                >

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(
                                e.target.value
                            );
                            setShowSearch(true);
                        }}
                        onFocus={() =>
                            setShowSearch(true)
                        }
                        placeholder="Search jobs..."
                        className="h-11 w-[430px] rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-5 text-sm outline-none transition focus:border-black focus:bg-white"
                    />

                    {showSearch &&
                        search.trim() && (

                            <div className="absolute top-14 z-50 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                                {searchLoading ? (

                                    <div className="p-6 text-center text-gray-500">

                                        Searching...

                                    </div>

                                ) : searchResults.length ===
                                    0 ? (

                                    <div className="p-6 text-center text-gray-500">

                                        No jobs found.

                                    </div>

                                ) : (

                                    searchResults.map(
                                        (
                                            job
                                        ) => (

                                            <button
                                                key={
                                                    job._id
                                                }
                                                onClick={() => {

                                                    navigate(
                                                        `/jobs/${job._id}`
                                                    );

                                                    setShowSearch(
                                                        false
                                                    );

                                                    setSearch(
                                                        ""
                                                    );

                                                }}
                                                className="block w-full border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 last:border-0"
                                            >

                                                <h3 className="font-semibold">

                                                    {
                                                        job.title
                                                    }

                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">

                                                    {
                                                        job.company
                                                    }

                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">

                                                    {
                                                        job.location
                                                    }

                                                </p>

                                            </button>

                                        )
                                    )

                                )}

                            </div>

                        )}

                </div>

            </div>

            {/* ================= RIGHT ================= */}

            <div className="flex items-center gap-5">
                {/* Notifications */}

                <div
                    ref={notificationRef}
                    className="relative"
                >

                    <button
                        onClick={() =>
                            setShowNotifications(
                                (prev) => !prev
                            )
                        }
                        className="relative rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100"
                    >

                        <Bell size={20} />

                        {unread > 0 && (

                            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">

                                {unread > 99
                                    ? "99+"
                                    : unread}

                            </span>

                        )}

                    </button>

                    {showNotifications && (

                        <NotificationDropdown
                            onClose={() =>
                                setShowNotifications(
                                    false
                                )
                            }
                            onUnreadChange={
                                setUnread
                            }
                        />

                    )}

                </div>

                {/* Profile */}

                <div
                    ref={profileRef}
                    className="relative"
                >

                    <button
                        onClick={() =>
                            setShowProfile(
                                (prev) => !prev
                            )
                        }
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">

                            {user?.name
                                ?.charAt(0)
                                .toUpperCase() || "U"}

                        </div>

                        <div className="hidden text-left md:block">

                            <h3 className="text-sm font-semibold">
                                {user?.name}
                            </h3>

                            <p className="text-xs capitalize text-gray-500">
                                {user?.role}
                            </p>

                        </div>

                        <ChevronDown
                            size={18}
                            className={`transition-transform ${showProfile
                                    ? "rotate-180"
                                    : ""
                                }`}
                        />

                    </button>

                    {showProfile && (

                        <ProfileDropdown
                            onClose={() =>
                                setShowProfile(
                                    false
                                )
                            }
                        />

                    )}

                </div>

            </div>

        </header>

    );

};

export default Topbar; 