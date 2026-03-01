/**
 * authService - Servicio de autenticación
 * Conecta con el backend (LDAP) para autenticar usuarios
 */

import { config } from '@/Config/app.config';

export interface Role {
  id: number;
  name: string;
}

export interface Career {
  carrera_id: number;
  carrera_sede_id: number;
  nombre: string;
  facultad_id: number;
}

export interface User {
  usuario_id: number;
  id: number; // Alias para compatibilidad
  cedula: string;
  nombre: string;
  name: string; // Alias para compatibilidad
  email: string;
  roles: Role[];
  careers: Career[];
  status: string;
  created_at: string;
  updated_at: string;
  all_permissions: any[];
  direct_permissions: any[];
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user';

export const authService = {
  loginWithCedula: async (cedula: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Validar que los campos no estén vacíos
      if (!cedula.trim() || !password.trim()) {
        throw new Error('La cédula y contraseña son obligatorias');
      }

      // PASO 1: Obtener cookie CSRF de Laravel Sanctum
      await fetch(`${config.API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include', // Incluir cookies
      });

      // PASO 2: Realizar login (con cookie CSRF ya seteada)
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Incluir cookies (CSRF + recibir auth_token)
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          cedula: cedula.trim(),
          password: password.trim(),
        }),
      });

      // Manejar errores HTTP
      if (!response.ok) {
        let errorMessage = 'Credenciales incorrectas. Intente de nuevo o contacte al administrador.';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            // Mostrar mensaje específico del backend si existe
            errorMessage = errorData.message;
          }
        } catch {
          // Si no se puede parsear el JSON, usar mensaje genérico
        }
        
        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const data = await response.json();

      if (!data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar SOLO usuario en localStorage (el token está en httpOnly cookie)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

      return {
        user: data.user,
        token: '', // Ya no se usa, está en cookie
      };
    } catch (error) {
      // Re-lanzar el error para que el componente lo maneje
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al iniciar sesión');
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Llamar al backend para limpiar la cookie
      await fetch(`${config.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Enviar cookie para autenticación
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getAuthToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const user = localStorage.getItem(USER_DATA_KEY);
    // El token está en httpOnly cookie, solo verificamos el usuario
    return !!user;
  }
};