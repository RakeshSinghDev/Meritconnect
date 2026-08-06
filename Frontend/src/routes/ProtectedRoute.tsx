import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../store/AuthContext";

const ProtectedRoute = ({
    role,
}: {
    role?: "candidate" | "recruiter";
}) => {

    const {
        user,
        loading,
    } = useAuth();

    if (loading) {

        return <>Loading...</>;

    }

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }

    if (
        role &&
        user.role !== role
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }

    return <Outlet />;

};

export default ProtectedRoute;