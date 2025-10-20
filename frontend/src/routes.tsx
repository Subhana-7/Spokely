import { useRoutes, type RouteObject } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
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
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import UserProfile from "./pages/user/UserSelfViewProfilePage";
import MentorProfile from "./pages/mentor/MentorSelfViewProfilePage";
import UserViewMentorProfile from "./pages/user/UserViewMentorProfile";
import MentorViewUserProfile from "./pages/mentor/MentorViewUserProfile";
import SessionsHub from "./pages/Sessions/MentorSessionsHub";
import MentorPublicSessions from "./pages/Sessions/PublicSessions";
import MentorScheduleSession from "./pages/Sessions/MentorScheduleSession";
import SessionListing from "./pages/admin/SessionListing";
import SessionDetailsPage from "./pages/admin/SessionDetailsPage";
import ChatBox from "./pages/chat/ChatBox";
import MentorCard from "./pages/user/mentorListing";
import StudentsPage from "./pages/Sessions/StudentsListing";
import ChatPage from "./pages/chat/ChatPage";
import DailyTaskPage from "./pages/user/dailyTask/DailyTask";
import WalletPage from "./pages/Wallet";

const appRoutes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
  {
    path: "/google-redirect",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <GoogleRedirectHandler />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/user/home",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <UserHome />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/connections",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <Connections />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/session",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <Sessions />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/schedule-session",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <SessionSchedule />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/session/details/:id",
    element: (
      <RoleProtectedRoute roles={["user","mentor"]}>
        <SessionDetail />
      </RoleProtectedRoute>
    ),
  },
  {
    path:"/user/daily/task",
    element:(
      <RoleProtectedRoute roles={["user"]}>
        <DailyTaskPage/>
      </RoleProtectedRoute>
    )
  },
  {
    path: "/user/profile",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <UserProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/mentor-profile/:id",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <UserViewMentorProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user/sessions/public",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <MentorPublicSessions />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/home",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <MentorHome />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/profile",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <MentorProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user-profile/:id",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <MentorViewUserProfile />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/user-profile/:id",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <MentorViewUserProfile />
      </RoleProtectedRoute>
    ),
  },
    {
    path: "/user/mentors",
    element: (
      <RoleProtectedRoute roles={["user"]}>
        <MentorCard />
      </RoleProtectedRoute>
    ),
  },
{
  path: "/user/chat",
  element: (
    <RoleProtectedRoute roles={["user","mentor"]}>
      <ChatPage />
    </RoleProtectedRoute>
  ),
},
{
  path: "/mentor/chat",
  element: (
    <RoleProtectedRoute roles={["mentor"]}>
      <ChatPage />
    </RoleProtectedRoute>
  ),
},
  {
    path: "/mentor/sessions",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <SessionsHub />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/schedule-session",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <MentorScheduleSession />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/mentor/my-students",
    element: (
      <RoleProtectedRoute roles={["mentor"]}>
        <StudentsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/session/:id/video",
    element:(
    <RoleProtectedRoute roles={["user","mentor"]}>
     <VideoCall />
    </RoleProtectedRoute>
    )
  },
  {
    path:"/wallet",
    element:(
      <RoleProtectedRoute roles={["user","mentor"]}>
     <WalletPage/>
    </RoleProtectedRoute>
    )
  },

  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: (
      <RoleProtectedRoute roles={["admin"]}>
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
