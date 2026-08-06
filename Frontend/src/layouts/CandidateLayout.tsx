import { Outlet } from "react-router-dom";
import CandidateSidebar from "../components/candidate/CandidateSidebar";
import Topbar from "../components/dashboard/Topbar";

const CandidateLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#F7F7F5] font-sans antialiased text-neutral-900">
            <CandidateSidebar />

            <div className="flex flex-1 flex-col min-w-0">
                <Topbar />

                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CandidateLayout;