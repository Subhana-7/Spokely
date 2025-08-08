import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { useAuthInit } from "./hooks/useAuthInit";

function App() {
  const loading = useAuthInit();

  if (loading) return <p>Loading session...</p>;

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
