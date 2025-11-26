import { lazy, Suspense, useMemo } from "react";
import { useRoutes, type RouteObject } from "react-router-dom";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const GoogleRedirectHandler = lazy(
  () => import("./modals/GoogleRedirectHandler")
);
const UserHome = lazy(() => import("./pages/user/UserDashboard"));
const Connections = lazy(() => import("./pages/user/connections/Connections"));
const MentorHome = lazy(() => import("./pages/mentor/MentorDashboard"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagemnt"));
const MentorManagement = lazy(() => import("./pages/admin/MentorManagement"));
const Sessions = lazy(() => import("./pages/Sessions/Sessions"));
const SessionSchedule = lazy(() => import("./pages/Sessions/ScheduleSessions"));
const SessionDetail = lazy(() => import("./pages/Sessions/SessionDetails"));
const VideoCall = lazy(() => import("./pages/VideoCall"));
const MentorVerification = lazy(
  () => import("./pages/admin/MentorVerification")
);
const UserProfile = lazy(() => import("./pages/user/UserSelfViewProfilePage"));
const MentorProfile = lazy(
  () => import("./pages/mentor/MentorSelfViewProfilePage")
);
const UserViewMentorProfile = lazy(
  () => import("./pages/user/UserViewMentorProfile")
);
const MentorViewUserProfile = lazy(
  () => import("./pages/mentor/MentorViewUserProfile")
);
const SessionsHub = lazy(() => import("./pages/Sessions/MentorSessionsHub"));
const MentorPublicSessions = lazy(
  () => import("./pages/Sessions/PublicSessions")
);
const MentorScheduleSession = lazy(
  () => import("./pages/Sessions/MentorScheduleSession")
);
const SessionListing = lazy(() => import("./pages/admin/SessionListing"));
const SessionDetailsPage = lazy(
  () => import("./pages/admin/SessionDetailsPage")
);
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const MentorCard = lazy(() => import("./pages/user/mentorListing"));
const StudentsPage = lazy(() => import("./pages/Sessions/StudentsListing"));
const DailyTaskPage = lazy(() => import("./pages/user/dailyTask/DailyTask"));
const WalletPage = lazy(() => import("./pages/Wallet"));
const PublicMentorListing = lazy(
  () => import("./pages/user/publicMentorListing")
);
const PaymentManagement = lazy(() => import("./pages/admin/PaymentManagement"));
const DailyTaskManagement = lazy(
  () => import("./pages/admin/DailyTaskManagement")
);
const Reports = lazy(() => import("./pages/admin/ReportsManagement"));

const SubscriptionHistory = lazy(() => import("./pages/user/SubscriptionHistory"));

const Notification = lazy(() => import("./pages/Notification"));
const PaymentDetails = lazy(() => import("./pages/PaymentDetails"));
const AdminDailyTaskDetails = lazy(() => import("./pages/admin/DailyTaskDetails"))

export default function AppRoutes() {
  const routes: RouteObject[] = useMemo(
    () => [
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
          <RoleProtectedRoute roles={["user", "mentor","admin"]}>
            <SessionDetail />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/user/daily/task",
        element: (
          <RoleProtectedRoute roles={["user"]}>
            <DailyTaskPage />
          </RoleProtectedRoute>
        ),
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
        path: "/mentor-profile/:id",
        element: (
          <RoleProtectedRoute roles={["user","mentor","admin"]}>
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
        path: "/user/subscription/history",
        element: (
          <RoleProtectedRoute roles={["user"]}>
            <SubscriptionHistory />
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
          <RoleProtectedRoute roles={["mentor", "user","admin"]}>
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
        path: "/user/public/mentors",
        element: (
          <RoleProtectedRoute roles={["user"]}>
            <PublicMentorListing />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <RoleProtectedRoute roles={["user","mentor"]}>
            <Notification />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/user/chat",
        element: (
          <RoleProtectedRoute roles={["user", "mentor"]}>
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
        element: (
          <RoleProtectedRoute roles={["user", "mentor"]}>
            <VideoCall />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/wallet",
        element: (
          <RoleProtectedRoute roles={["user", "mentor"]}>
            <WalletPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/payment/:id",
        element: (
          <RoleProtectedRoute roles={["admin"]}>
            <PaymentDetails />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "/admin/task/:id",
        element: (
          <RoleProtectedRoute roles={["admin"]}>
            <AdminDailyTaskDetails />
          </RoleProtectedRoute>
        ),
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
          { path: "mentors/verification/:id", element: <MentorVerification /> },
          { path: "sessions", element: <SessionListing /> },
          { path: "sessions/:id", element: <SessionDetailsPage /> },
          { path: "payment-management", element: <PaymentManagement /> },
          { path: "tasks", element: <DailyTaskManagement /> },
          { path: "reports", element: <Reports /> },
        ],
      },
    ],
    []
  );

  return (
    <Suspense fallback={<p>Loading page...</p>}>{useRoutes(routes)}</Suspense>
  );
}
