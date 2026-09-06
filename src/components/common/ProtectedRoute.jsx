import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, isAuthenticated } = useAuth();

  // Redirigir a login en caso de no haber sesión activa
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir a página 403 (Acceso Denegado) si no tiene los roles requeridos
  const userRole = user?.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  // Usuario autorizado
  return <Outlet />;
};

export default ProtectedRoute;