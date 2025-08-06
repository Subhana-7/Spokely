// src/components/RoleProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/userAuthStore";
import type { JSX } from "react";

interface Props {
  role: "user" | "mentor" | "admin";
  children: JSX.Element;
}

const RoleProtectedRoute = ({ role, children }: Props) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" />;

  if (user?.role !== role) return <Navigate to="/" />;

  return children;
};

export default RoleProtectedRoute;
