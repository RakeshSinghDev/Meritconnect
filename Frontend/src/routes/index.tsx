import { createBrowserRouter, useRouteError } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/HomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../layouts/DashboardLayout";
import CandidateLayout from "../layouts/CandidateLayout";

// Recruiter Pages
import RecruiterDashboard from "../pages/recruiter/Dashboard";
import RecruiterJobs from "../pages/recruiter/Jobs";
import RecruiterApplications from "../pages/recruiter/Applications";
import RecruiterCandidates from "../pages/recruiter/Candidates";
import CandidateDetails from "../pages/recruiter/CandidateDetails";
import RecruiterAnalytics from "../pages/recruiter/Analytics";
import RecruiterNotifications from "../pages/recruiter/Notifications";
import RecruiterSettings from "../pages/recruiter/Settings";
import RecruiterInterviews from "../pages/recruiter/Interviews";

import { RecruiterAIInterviewReportPage } from "../pages/recruiter/AIInterviewReport";

// Candidate Pages
import CandidateDashboard from "../pages/candidate/Dashboard";
import CandidateJobs from "../pages/candidate/Jobs";
import JobDetails from "../pages/candidate/JobDetails";
import ApplyJob from "../pages/candidate/ApplyJob";
import MyApplications from "../pages/candidate/MyApplications";
import CandidateProfile from "../pages/candidate/Profile";
import CandidateNotifications from "../pages/candidate/Notifications";
import CandidateSettings from "../pages/candidate/Settings";
import { AIInterviewWaiting } from "../pages/candidate/AIInterviewWaiting";
import { AIInterviewLive } from "../pages/candidate/AIInterviewLive";
import { AIInterviewReportPage } from "../pages/candidate/AIInterviewReport";
import RecruiterAIInterviewsPage from "../pages/recruiter/AIInterviews";
import { AIInterviewsPage } from "../pages/candidate/AIInterviews";
import AIJobFinder from "../pages/candidate/AIJobFinder";

// Error Boundary Element
const RouteErrorBoundary = () => {
    const error = useRouteError() as any;
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
            <div className="max-w-md space-y-4 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="text-4xl font-extrabold text-blue-500">MeritConnect</div>
                <h2 className="text-xl font-bold text-slate-200">Navigation Notice</h2>
                <p className="text-xs text-slate-400">
                    {error?.statusText || error?.message || "The requested view is preparing or unavailable."}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export const router = createBrowserRouter([
    // Public Routes
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
                        element: <RecruiterJobs />,
                    },
                    {
                        path: "/recruiter/applications",
                        element: <RecruiterApplications />,
                    },
                    {
                        path: "/recruiter/candidates",
                        element: <RecruiterCandidates />,
                    },
                    {
                        path: "/recruiter/candidates/:applicationId",
                        element: <CandidateDetails />,
                    },
                    {
                        path: "/recruiter/interviews",
                        element: <RecruiterInterviews />,
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
                        element: <RecruiterAnalytics />,
                    },
                    {
                        path: "/recruiter/notifications",
                        element: <RecruiterNotifications />,
                    },
                    {
                        path: "/recruiter/settings",
                        element: <RecruiterSettings />,
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
                        path: "/candidate/job-finder",
                        element: <AIJobFinder />,
                    },
                    {
                        path: "/candidate/profile",
                        element: <CandidateProfile />,
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

    // 404 Route
    {
        path: "*",
        element: (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 text-center">
                <div className="max-w-md space-y-4 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                    <h1 className="text-5xl font-extrabold text-blue-500">404</h1>
                    <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
                    <p className="text-xs text-slate-400">The URL you navigated to does not exist.</p>
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