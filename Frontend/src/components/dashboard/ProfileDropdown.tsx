import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../store/AuthContext";

interface Props {
    onClose: () => void;
}

const ProfileDropdown = ({ onClose }: Props) => {
    const navigate = useNavigate();

    const { user, logoutUser } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUser();

            toast.success("Logged out successfully");

            navigate("/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="absolute right-0 top-16 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            <div className="border-b p-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            {user?.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {user?.email}
                        </p>

                        <p className="mt-1 text-xs capitalize text-gray-400">
                            {user?.role}
                        </p>

                    </div>

                </div>

            </div>

            <button
                onClick={() => {
                    navigate("/profile");
                    onClose();
                }}
                className="flex w-full items-center gap-3 px-5 py-4 transition hover:bg-gray-50"
            >
                <User size={18} />
                My Profile
            </button>

            <button
                onClick={() => {
                    navigate("/settings");
                    onClose();
                }}
                className="flex w-full items-center gap-3 px-5 py-4 transition hover:bg-gray-50"
            >
                <Settings size={18} />
                Settings
            </button>

            <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t px-5 py-4 text-red-600 transition hover:bg-red-50"
            >
                <LogOut size={18} />
                Logout
            </button>

        </div>
    );
};

export default ProfileDropdown;