import { Outlet } from "react-router-dom";

const RecruiterLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="border-b bg-white px-8 py-4 shadow-sm">
                <h1 className="text-2xl font-bold">
                    Recruiter Dashboard
                </h1>
            </header>

            <main className="mx-auto max-w-7xl p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default RecruiterLayout;