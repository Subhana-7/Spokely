import { BrowserRouter, useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes  from "./routes";


function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
