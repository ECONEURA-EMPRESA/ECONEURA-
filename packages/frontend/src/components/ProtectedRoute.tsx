import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    token: string | null;
    redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Protege rutas que requieren autenticación.
 * Si NO hay token, redirige a /login.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    token,
    redirectTo = '/login'
}) => {
    if (!token) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
