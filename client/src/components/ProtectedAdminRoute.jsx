import { Navigate } from "react-router-dom";
import authService from "../services/authService";

export default function ProtectedAdminRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
