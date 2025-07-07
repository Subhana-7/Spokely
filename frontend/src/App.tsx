import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/contexts/ThemeContext";
import LandingPage from "./components/LandingPage";
import UserHome from "./pages/user/UserDashboard";
import MentorHome from "./pages/mentor/MentorDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagemnt";
import MentorManagement from "./pages/admin/MentorManagement";
import GoogleRedirectHandler from "./modals/GoogleRedirectHandler";
import Connections from "./pages/user/connections/Connections";
import { AuthProvider } from "./components/contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/google-redirect"
              element={<GoogleRedirectHandler />}
            />
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user/connections" element={<Connections/>}/>
            <Route path="/mentor/home" element={<MentorHome />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="mentors" element={<MentorManagement />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
