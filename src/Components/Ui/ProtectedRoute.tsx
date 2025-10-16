/**
 * ProtectedRoute - Componente para proteger rutas
 * Redirige a login si no está autenticado
 * Bloquea acceso si no tiene el rol requerido
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'SuperUsuario' | 'Administrador';
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere un rol específico, validar
  if (requireRole) {
    const hasRole = user?.roles?.some(r => r.name === requireRole);
    if (!hasRole) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          maxWidth: '500px',
          margin: '100px auto'
        }}>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};