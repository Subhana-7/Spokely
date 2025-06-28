import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import UserHome from './pages/user/UserHome';
import MentorHome from './pages/mentor/MentorHome';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/mentor/home" element={<MentorHome />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
