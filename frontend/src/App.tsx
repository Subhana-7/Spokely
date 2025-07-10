import { BrowserRouter, useRoutes } from "react-router-dom";
import { ThemeProvider } from "./components/contexts/ThemeContext";
import { AuthProvider } from "./components/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { appRoutes } from "./routes";

const AppRoutes = () => useRoutes(appRoutes);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
