import { useLocation, Navigate } from 'react-router-dom';
import tokenService from "@/services/tokenService.ts";

import { ReactNode } from 'react';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
    const location = useLocation();
    const token = tokenService.getToken();
    const userRole = tokenService.getUserInfo()?.role;
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole!)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default PrivateRoute;