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
import Sessions from "./pages/Sessions/Sessions";
import SessionSchedule from "./pages/Sessions/ScheduleSessions";
import SessionDetail from "./pages/Sessions/SessionDetails";
import VideoCall from "./pages/VideoCall";
import MentorVerification from "./pages/admin/MentorVerification";
import RoleProtectedRoute from "./components/contexts/RoleProtectedRoute";
import UserProfile from "./pages/user/UserSelfViewProfilePage";
import MentorProfile from "./pages/mentor/MentorSelfViewProfilePage";
import UserViewMentorProfile from "./pages/user/UserViewMentorProfile";
import MentorViewUserProfile from "./pages/mentor/MentorViewUserProfile";

const appRoutes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
  {
    path: "/google-redirect",
    element: (
      <RoleProtectedRoute role="user">
        <GoogleRedirectHandler />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/user/home",
    element: <UserHome />,
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
    path: "/user/profile",
    element: (
      <RoleProtectedRoute role="user">
        <UserProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/mentor/profile",
    element: (
      <RoleProtectedRoute role="user">
        <UserViewMentorProfile />
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
    path: "/mentor/profile",
    element: (
      <RoleProtectedRoute role="user">
        <MentorProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/user/profile",
    element: (
      <RoleProtectedRoute role="user">
        <MentorViewUserProfile />
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

export default function AppRoutes() {
  return useRoutes(appRoutes);
}
