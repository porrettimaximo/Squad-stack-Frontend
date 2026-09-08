import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ allowedRoles, disallowedRoles }) => {
  const { token, user, isAuthenticated } = useAuth();

  // Redirigir a login en caso de no haber sesión activa
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toLowerCase() || "";

  // Redirigir a /admin si el rol no está permitido en esta sección (o 403)
  if (disallowedRoles && disallowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/403"} replace />;
  }

  // Redirigir a página 403 (Acceso Denegado) si no tiene los roles requeridos
  if (allowedRoles && !allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  // Usuario autorizado
  return <Outlet />;
};

export default ProtectedRoute;
