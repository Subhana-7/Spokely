import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import UserHome from './pages/user/UserHome';
import MentorHome from './pages/mentor/MentorHome';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagemnt';
import MentorManagement from './pages/admin/MentorManagement';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/mentor/home" element={<MentorHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="mentors" element={<MentorManagement />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
