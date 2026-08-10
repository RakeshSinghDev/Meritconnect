import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { socket } from "../lib/socket";

import {
    login,
    logout,
    me,
} from "../services/auth.service";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "candidate" | "recruiter";
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginUser: (
        email: string,
        password: string
    ) => Promise<User>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const hasAuthSession =
                Boolean(localStorage.getItem("accessToken")) ||
                Boolean(localStorage.getItem("refreshToken")) ||
                localStorage.getItem("isLoggedIn") === "true";

            if (!hasAuthSession) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await me();
                const fetchedUser = response.data?.user || response.data;
                setUser(fetchedUser);

                if (!socket.connected) {
                    socket.connect();
                }
                if (fetchedUser?._id) {
                    socket.emit("join", fetchedUser._id);
                }
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("isLoggedIn");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const loginUser = async (
        email: string,
        password: string
    ): Promise<User> => {
        const response = await login({
            email,
            password,
        });

        const resData = response.data || response;
        const loggedInUser = resData.user || response.user || resData;
        const accessToken =
            resData.accessToken ||
            response.accessToken ||
            (response.data && response.data.accessToken);
        const refreshToken =
            resData.refreshToken ||
            response.refreshToken ||
            (response.data && response.data.refreshToken);

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        localStorage.setItem("isLoggedIn", "true");
        setUser(loggedInUser);
        if (!socket.connected) {
            socket.connect();
        }
        if (loggedInUser?._id) {
            socket.emit("join", loggedInUser._id);
        }

        return loggedInUser;
    };

    const logoutUser = async () => {
        try {
            await logout();
        } catch {
            // Ignore logout API failure
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("isLoggedIn");
            socket.disconnect();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);