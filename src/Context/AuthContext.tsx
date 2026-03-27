/**
 * AuthContext - Contexto global de autenticación
 * Maneja el estado del usuario autenticado y sus permisos
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService, type User, type Career } from "@/Services/AuthService";
import { useSessionWatcher } from "@/Hooks/useSessionWatcher";

interface LoginCredentials {
  cedula: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // Para el login/logout
  authChecked: boolean; // Para la verificación inicial
  isAuthenticated: boolean;
  isSuperUser: () => boolean;
  isAdmin: () => boolean;
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
    return user?.roles?.some((r) => r.name === "Superusuario") || false;
  };

  const isAdmin = (): boolean => {
    return user?.roles?.some((r) => r.name === "Administrador") || false;
  };

  /**
   * Verifica si el usuario puede hacer archivos públicos.
   * Según FilePolicy del backend, solo pueden:
   * - Superusuario
   * - Vicerrectoría de Docencia
   * - Administrador (Coordinador de Carrera)
   */
  const canMakeFilesPublic = (): boolean => {
    return (
      user?.roles?.some(
        (r) =>
          r.name === "Superusuario" ||
          r.name === "Vicerrectoría de Docencia" ||
          r.name === "Administrador",
      ) || false
    );
  };

  const getUserCareer = () => {
    return user?.careers?.[0] || null;
  };

  const value: AuthContextType = {
    user,
    loading,
    authChecked,
    error,
    isAuthenticated: !!user,
    isSuperUser,
    isAdmin,
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
