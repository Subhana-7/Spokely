import { ThemeProvider } from './components/contexts/ThemeContext';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
}

export default App;