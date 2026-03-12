import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { useAuthInit } from "./hooks/useAuthInit";
import { Suspense } from "react";
import Loader from "./components/Loader";

function App() {
  const loading = useAuthInit();

  if (loading) return <Loader />;

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AppRoutes />
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
