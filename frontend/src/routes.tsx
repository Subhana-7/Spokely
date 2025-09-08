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
import SessionsHub from "./pages/Sessions/MentorSessionsHub";
import MentorPublicSessions from "./pages/Sessions/PublicSessions";
import MentorScheduleSession from "./pages/Sessions/MentorScheduleSession";
import SessionListing from "./pages/admin/SessionListing";
import SessionDetailsPage from './pages/admin/SessionDetailsPage';
import MentorCard from "./pages/user/mentorListing";

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
    path: "/user/session/details/:id",
    element: (
      <RoleProtectedRoute role="user">
        <SessionDetail />
      </RoleProtectedRoute>
    ),
  },

   {
    path: "/mentor/session/details/:id",
    element: (
      <RoleProtectedRoute role="mentor">
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
    path: "/user/mentor-profile/:id",
    element: (
      <RoleProtectedRoute role="user">
        <UserViewMentorProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/sessions/public",
    element: (
      <RoleProtectedRoute role="user">
        <MentorPublicSessions />
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
      <RoleProtectedRoute role="mentor">
        <MentorProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user-profile",
    element: (
      <RoleProtectedRoute role="mentor">
        <MentorViewUserProfile />
      </RoleProtectedRoute>
    ),
  },
    {
    path: "/user-profile/:id",
    element: (
      <RoleProtectedRoute role="user">
        <MentorViewUserProfile />
      </RoleProtectedRoute>
    ),
  },
    {
    path: "/user/mentors",
    element: (
      <RoleProtectedRoute role="user">
        <MentorCard />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/sessions",
    element: (
      <RoleProtectedRoute role="mentor">
        <SessionsHub />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/schedule-session",
    element: (
      <RoleProtectedRoute role="mentor">
        <MentorScheduleSession />
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
      <RoleProtectedRoute role="admin">
      <AdminDashboard />
      </RoleProtectedRoute>
    ),
    children: [
      { path: "home", element: <Dashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "mentors", element: <MentorManagement /> },
      {
        path: "mentors/verification/:id",
        element: <MentorVerification />,
      },
      { path: "sessions", element: <SessionListing /> },
      { path: "sessions/:id", element: <SessionDetailsPage /> },
    ],
  },
];

export default function AppRoutes() {
  return useRoutes(appRoutes);
}