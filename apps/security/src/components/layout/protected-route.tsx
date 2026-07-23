import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactElement;
}

export default function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
