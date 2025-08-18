import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";
import { useEffect, type JSX } from "react";

const RoleProtectedRoute = ({
  role,
  children,
}: {
  role: "user" | "mentor" | "admin";
  children: JSX.Element;
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // useEffect(() => {
  //   console.log(user);
  //   initializeAuth();
  // }, [initializeAuth]);

  if (!isAuthenticated) return <Navigate to="/" />;

  if (user?.role !== role) return <Navigate to="/" />;

  return children;
};

export default RoleProtectedRoute;
