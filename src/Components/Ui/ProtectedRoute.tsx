/**
 * ProtectedRoute - Componente para proteger rutas
 * Redirige a login si no está autenticado
 * Bloquea acceso si no tiene el rol requerido
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";
import type { ReactNode } from "react";
import { LoadingSpinner } from "./Feedback/Loading";
import { ROUTES } from "@/Constants/ROUTES";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoles?: string[];
  requirePermissions?: string[];
  requireAllPermissions?: string[];
  requireCapabilities?: string[];
  requireAllCapabilities?: string[];
}

export const ProtectedRoute = ({
  children,
  requireRoles,
  requirePermissions,
  requireAllPermissions,
  requireCapabilities,
  requireAllCapabilities,
}: ProtectedRouteProps) => {
  const { isAuthenticated, authChecked, canAccess } = useAuth();

  // Mientras se verifica la sesión, mostrar un loader
  if (!authChecked) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  // Si la verificación terminó y no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si requiere roles específicos, validar
  if (
    !canAccess({
      requireRoles,
      requireAnyPermissions: requirePermissions,
      requireAllPermissions,
      requireAnyCapabilities: requireCapabilities,
      requireAllCapabilities,
    })
  ) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "100px auto",
        }}
      >
        <h2>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
};
