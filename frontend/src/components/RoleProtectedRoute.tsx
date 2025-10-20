import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import type { JSX } from "react";

interface Props {
  roles: ("user" | "mentor" | "admin")[];
  children: JSX.Element;
}

const RoleProtectedRoute = ({ roles, children }: Props) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" />;

  if (!user || !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

export default RoleProtectedRoute;
