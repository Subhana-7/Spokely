import { useRoutes, type RouteObject } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import GoogleRedirectHandler from "./modals/GoogleRedirectHandler";
import UserHome from "./pages/user/UserDashboard";
import Connections from "./pages/user/connections/Connections";
import MentorHome from "./pages/mentor/MentorDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagemnt";
import MentorManagement from "./pages/admin/MentorManagement";
import Sessions from './pages/Sessions/Sessions';
import SessionSchedule from './pages/Sessions/ScheduleSessions';
import SessionDetail from "./pages/Sessions/SessionDetails";
import VideoCall from "./pages/VideoCall";
import MentorVerification from "./pages/admin/MentorVerification";
import RoleProtectedRoute from "./components/contexts/RoleProtectedRoute";

const appRoutes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
  { path: "/google-redirect", element: <GoogleRedirectHandler /> },

  {
    path: "/user/home",
    element: (
      <RoleProtectedRoute role="user">
        <UserHome />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/connections",
    element: (
      <RoleProtectedRoute role="user">
        <Connections />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/session",
    element: (
      <RoleProtectedRoute role="user">
        <Sessions />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/schedule-session",
    element: (
      <RoleProtectedRoute role="user">
        <SessionSchedule />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/session/:id",
    element: (
      <RoleProtectedRoute role="user">
        <SessionDetail />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/home",
    element: (
      <RoleProtectedRoute role="mentor">
        <MentorHome />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/session/:id/video",
    element: <VideoCall />,
  },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: (
      // <RoleProtectedRoute role="admin">
        <AdminDashboard />
      // </RoleProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "mentors", element: <MentorManagement /> },
      {
        path: "mentors/verification/:id",
        element: <MentorVerification />,
      },
    ],
  },
];

// ✅ Export a wrapper component that uses useRoutes
export default function AppRoutes() {
  return useRoutes(appRoutes);
}
