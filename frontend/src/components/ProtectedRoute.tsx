import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
