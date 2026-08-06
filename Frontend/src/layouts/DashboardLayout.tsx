import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#F6F6F7] font-sans antialiased text-[#111111]">
            <Sidebar />

            <div className="flex flex-1 flex-col min-w-0">
                <Topbar />

                <main className="flex-1 overflow-y-auto p-8 md:p-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;