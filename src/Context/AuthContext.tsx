/**
 * AuthContext - Contexto global de autenticación
 * Maneja el estado del usuario autenticado y sus permisos
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, type User, type Role, type Career } from '@/Services/AuthService';

interface LoginCredentials {
  cedula: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperUser: () => boolean;
  isAdmin: () => boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar usuario desde localStorage al montar
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const { user } = await authService.loginWithCedula(
        credentials.cedula,
        credentials.password
      );
      setUser(user);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
      throw e;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      authService.logout();
      setUser(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cerrar sesión');
      throw e;
    }
  };

  const isSuperUser = (): boolean => {
    return user?.roles?.some(r => r.name === 'SuperUsuario') || false;
  };

  const isAdmin = (): boolean => {
    return user?.roles?.some(r => r.name === 'Administrador') || false;
  };

  const getUserCareer = () => {
    return user?.careers?.[0] || null;
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isSuperUser,
    isAdmin,
    getUserCareer,
    login,
    logout
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};