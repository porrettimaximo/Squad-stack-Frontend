import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ allowedRoles }) => {
    const { token, user, isAuthenticated } = useAuth();

    //Redirigir a login en caso de no haber sesion activa
    if (!isAuthenticated && !token) {
        return <Navigate to="/login" replace />;
    }

    //Redirigir a dashboard si no tiene permisos
    const userRole = user?.role;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    //validaciones autorizadas
    return <Outlet />
};

export default ProtectedRoute;