/**
 * ProtectedRoute - Componente para proteger rutas
 * Redirige a login si no está autenticado
 * Bloquea acceso si no tiene el rol requerido
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";
import type { ReactNode } from "react";
import { LoadingSpinner } from "./Feedback/Loading";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  requireRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, authChecked } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // Si requiere roles específicos, validar
  if (requireRoles && requireRoles.length > 0) {
    // Superusuario tiene acceso a todo
    const isSuperUser = user?.roles?.some((r) => r.name === "Superusuario");
    const hasRole = user?.roles?.some((r) => requireRoles.includes(r.name));

    if (!isSuperUser && !hasRole) {
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
  }

  return <>{children}</>;
};
