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

            try {

                const response = await me();

                // Backend returns:
                // {
                //   success,
                //   statusCode,
                //   message,
                //   data: user
                // }

                setUser(response.data);

                if (!socket.connected) {
                    socket.connect();
                }
                socket.emit("join", response.data._id);

            } catch {

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

        // Backend returns:
        // {
        //   success,
        //   statusCode,
        //   message,
        //   data: {
        //      user
        //   }
        // }

        const loggedInUser = response.data.user;

        setUser(loggedInUser);
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("join", loggedInUser._id);

        return loggedInUser;

    };

    const logoutUser = async () => {

        await logout();

        socket.disconnect();

        setUser(null);

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