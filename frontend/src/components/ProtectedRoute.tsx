import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";

interface ProtectedRouteProps {
  allowedRoles?: ("user" | "mentor" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const hydrationComplete = useAuthStore((state) => state.hydrationComplete);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  console.log(isAuthenticated,role,hydrationComplete,initializeAuth)

  useEffect(() => {
    initializeAuth(); // Only runs once
  }, [initializeAuth]);

  if (!hydrationComplete) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
