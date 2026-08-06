import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";

import ProtectedRoute from "../routes/ProtectedRoute";

import HomePage from "../pages/HomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../layouts/DashboardLayout";
import CandidateLayout from "../layouts/CandidateLayout";

// Recruiter Pages
import RecruiterDashboard from "../pages/recruiter/Dashboard";
import Jobs from "../pages/recruiter/Jobs";
import Applications from "../pages/recruiter/Applications";
import Candidates from "../pages/recruiter/Candidates";
import CandidateDetails from "../pages/recruiter/CandidateDetails";
import ResumeViewerPage from "../pages/recruiter/ResumeViewer";
import Interviews from "../pages/recruiter/Interviews";
import Analytics from "../pages/recruiter/Analytics";
import Settings from "../pages/recruiter/Settings";
import RecruiterNotifications from "../pages/recruiter/Notifications";
import RecruiterAIInterviewsPage from "../pages/recruiter/AIInterviews";
import RecruiterAIInterviewReportPage from "../pages/recruiter/AIInterviewReport";

// Candidate Pages
import CandidateDashboard from "../pages/candidate/Dashboard";
import CandidateJobs from "../pages/candidate/Jobs";
import JobDetails from "../pages/candidate/JobDetails";
import ApplyJob from "../pages/candidate/ApplyJob";
import MyApplications from "../pages/candidate/MyApplications";
import Profile from "../pages/candidate/Profile";
import CandidateNotifications from "../pages/candidate/Notifications";
import CandidateSettings from "../pages/candidate/Settings";
import { AIInterviewWaiting } from "../pages/candidate/AIInterviewWaiting";
import { AIInterviewLive } from "../pages/candidate/AIInterviewLive";
import { AIInterviewReportPage } from "../pages/candidate/AIInterviewReport";
import { AIInterviewsPage } from "../pages/candidate/AIInterviews";

// Error Boundary Component
const RouteErrorBoundary = () => {
    const error = useRouteError() as any;
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
            <div className="max-w-md space-y-4 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="text-4xl font-extrabold text-blue-500">MeritConnect</div>
                <h2 className="text-xl font-bold text-slate-200">Page Navigation Notice</h2>
                <p className="text-xs text-slate-400">
                    {error?.statusText || error?.message || "The requested view is preparing or unavailable."}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export const router = createBrowserRouter([
    // Public Landing Page
    {
        path: "/",
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />,
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <RouteErrorBoundary />,
    },
    {
        path: "/register",
        element: <Register />,
        errorElement: <RouteErrorBoundary />,
    },

    // Recruiter Routes
    {
        element: <ProtectedRoute role="recruiter" />,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/recruiter/dashboard",
                        element: <RecruiterDashboard />,
                    },
                    {
                        path: "/recruiter/jobs",
                        element: <Jobs />,
                    },
                    {
                        path: "/recruiter/applications",
                        element: <Applications />,
                    },
                    {
                        path: "/recruiter/applications/:applicationId/resume",
                        element: <ResumeViewerPage />,
                    },
                    {
                        path: "/recruiter/candidates",
                        element: <Candidates />,
                    },
                    {
                        path: "/recruiter/candidates/:applicationId",
                        element: <CandidateDetails />,
                    },
                    {
                        path: "/recruiter/interviews",
                        element: <Interviews />,
                    },
                    {
                        path: "/recruiter/ai-interviews",
                        element: <RecruiterAIInterviewsPage />,
                    },
                    {
                        path: "/recruiter/ai-interviews/:id/report",
                        element: <RecruiterAIInterviewReportPage />,
                    },
                    {
                        path: "/recruiter/analytics",
                        element: <Analytics />,
                    },
                    {
                        path: "/recruiter/notifications",
                        element: <RecruiterNotifications />,
                    },
                    {
                        path: "/recruiter/settings",
                        element: <Settings />,
                    },
                ],
            },
        ],
    },

    // Candidate Routes
    {
        element: <ProtectedRoute role="candidate" />,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                path: "/candidate/ai-interviews/:id/waiting",
                element: <AIInterviewWaiting />,
            },
            {
                path: "/candidate/ai-interviews/:id/live",
                element: <AIInterviewLive />,
            },
            {
                element: <CandidateLayout />,
                children: [
                    {
                        path: "/candidate/dashboard",
                        element: <CandidateDashboard />,
                    },
                    {
                        path: "/candidate/jobs",
                        element: <CandidateJobs />,
                    },
                    {
                        path: "/candidate/jobs/:id",
                        element: <JobDetails />,
                    },
                    {
                        path: "/candidate/jobs/:id/apply",
                        element: <ApplyJob />,
                    },
                    {
                        path: "/candidate/applications",
                        element: <MyApplications />,
                    },
                    {
                        path: "/candidate/profile",
                        element: <Profile />,
                    },
                    {
                        path: "/candidate/notifications",
                        element: <CandidateNotifications />,
                    },
                    {
                        path: "/candidate/settings",
                        element: <CandidateSettings />,
                    },
                    {
                        path: "/candidate/ai-interviews",
                        element: <AIInterviewsPage />,
                    },
                    {
                        path: "/candidate/ai-interviews/:id/report",
                        element: <AIInterviewReportPage />,
                    },
                ],
            },
        ],
    },

    // 404 Fallback
    {
        path: "*",
        element: (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 text-center">
                <div className="max-w-md space-y-4 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                    <h1 className="text-5xl font-extrabold text-blue-500">404</h1>
                    <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
                    <p className="text-xs text-slate-400">The page you requested could not be located.</p>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        ),
    },
]);