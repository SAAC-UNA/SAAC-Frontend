/**
 * AuthContext - Contexto global de autenticación
 * Maneja el estado del usuario autenticado y sus permisos
 */

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { authService, type User, type Career } from "@/Services/AuthService";
import { useSessionWatcher } from "@/Hooks/useSessionWatcher";
import {
  evaluateAccess,
  getUserPermissionNames,
  getUserRoleNames,
  type AccessRule,
} from "@/Utils/Authorization";

interface LoginCredentials {
  cedula: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  userRoleNames: string[];
  userPermissionNames: string[];
  loading: boolean; // Para el login/logout
  authChecked: boolean; // Para la verificación inicial
  isAuthenticated: boolean;
  isSuperUser: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccess: (rule?: AccessRule) => boolean;
  canMakeFilesPublic: () => boolean;
  getUserCareer: () => Career | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Carga de login/logout
  const [authChecked, setAuthChecked] = useState(false); // Carga inicial
  const [error, setError] = useState<string | null>(null);
  useSessionWatcher();

  const userRoleNames = useMemo(() => getUserRoleNames(user?.roles), [user]);
  const userPermissionNames = useMemo(
    () => getUserPermissionNames(user?.all_permissions),
    [user],
  );

  // Verificación de sesión al montar el provider
  useEffect(() => {
    const checkSession = async () => {
      const sessionUser = await authService.checkAuthStatus();
      setUser(sessionUser);
      setAuthChecked(true); // Marcamos que la verificación inicial terminó
    };
    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      const { user } = await authService.loginWithCedula(
        credentials.cedula,
        credentials.password,
      );
      setUser(user);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cerrar sesión");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const isSuperUser = (): boolean => {
    return userRoleNames.includes("Superusuario");
  };

  const isAdmin = (): boolean => {
    return userRoleNames.includes("Administrador");
  };

  const hasRole = (role: string): boolean => {
    return userRoleNames.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => userRoleNames.includes(role));
  };

  const hasPermission = (permission: string): boolean => {
    return canAccess({ requireAnyPermissions: [permission] });
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return canAccess({ requireAnyPermissions: permissions });
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return canAccess({ requireAllPermissions: permissions });
  };

  const canAccess = (rule?: AccessRule): boolean => {
    return evaluateAccess(
      {
        roles: userRoleNames,
        permissions: userPermissionNames,
      },
      rule,
    );
  };

  /**
   * Verifica si el usuario puede hacer archivos públicos.
   * Según FilePolicy del backend, solo pueden:
   * - Superusuario
   * - Vicerrectoría de Docencia
   * - Administrador (Coordinador de Carrera)
   */
  const canMakeFilesPublic = (): boolean => {
    return canAccess({ requireAnyPermissions: ["archivos.make_public"] });
  };

  const getUserCareer = () => {
    return user?.careers?.[0] || null;
  };

  const value: AuthContextType = {
    user,
    userRoleNames,
    userPermissionNames,
    loading,
    authChecked,
    error,
    isAuthenticated: !!user,
    isSuperUser,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    canMakeFilesPublic,
    getUserCareer,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
