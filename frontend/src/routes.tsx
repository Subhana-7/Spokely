// AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleRedirectHandler from "./modals/GoogleRedirectHandler";

// User Pages
import UserHome from "./pages/user/UserDashboard";
import Connections from "./pages/user/connections/Connections";
import Sessions from "./pages/Sessions/Sessions";
import SessionSchedule from "./pages/Sessions/ScheduleSessions";
import SessionDetail from "./pages/Sessions/SessionDetails";

// Mentor Pages
import MentorHome from "./pages/mentor/MentorDashboard";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagemnt";
import MentorManagement from "./pages/admin/MentorManagement";
import MentorVerification from "./pages/admin/MentorVerification";

// Shared
import VideoCall from "./pages/VideoCall";
import LandingPage from "./components/LandingPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/google-redirect" element={<GoogleRedirectHandler />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ Protected User Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={["user"]} />}> */}
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/connections" element={<Connections />} />
          <Route path="/user/session" element={<Sessions />} />
          <Route path="/user/schedule-session" element={<SessionSchedule />} />
          <Route path="/user/session/:id" element={<SessionDetail />} />
        {/* </Route> */}

        {/* ✅ Protected Mentor Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}> */}
          <Route path="/mentor/home" element={<MentorHome />} />
        {/* </Route> */}

        {/* ✅ Protected Admin Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="mentors" element={<MentorManagement />} />
            <Route path="mentors/verification/:id" element={<MentorVerification />} />
          </Route>
        {/* </Route> */}

        {/* ✅ Session video call (shared between user/mentor) */}
        {/* <Route
          path="/session/:id/video"
          element={
            <ProtectedRoute allowedRoles={["user", "mentor"]}>
              <VideoCall />
            </ProtectedRoute>
          }
        /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
