import type { RouteObject } from "react-router-dom";
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

export const appRoutes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
  { path: "/google-redirect", element: <GoogleRedirectHandler /> },
  { path: "/user/home", element: <UserHome /> },
  { path: "/user/connections", element: <Connections /> },
  { path: "/mentor/home", element: <MentorHome /> },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <AdminDashboard />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "mentors", element: <MentorManagement /> },
    ],
  },
  { path: "/user/session", element: <Sessions /> },
  { path: "/user/schedule-session", element: <SessionSchedule /> },
  { path: "/user/session/:id", element: <SessionDetail /> },
  { path: "/session/:id/video", element: <VideoCall /> },
];
