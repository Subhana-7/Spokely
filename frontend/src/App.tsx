import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { useAuthInit } from "./hooks/useAuthInit";
import { Suspense } from "react";

function App() {
  const loading = useAuthInit();

  if (loading) return <p>Loading session...</p>;

  return (
    <BrowserRouter>
      <Suspense fallback={<p>Loading page...</p>}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
