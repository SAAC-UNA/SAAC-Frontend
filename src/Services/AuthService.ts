/**
 * authService - Servicio de autenticación
 * Conecta con el backend (LDAP) para autenticar usuarios
 */

import { axiosInstance } from '@/Config/axios';
import type { MockUser } from '@/Mocks/Users';
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

      // Realizar solicitud POST al backend
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

      if (!data.user || !data.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      // Re-lanzar el error para que el componente lo maneje
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al iniciar sesión');
    }
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getAuthToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(USER_DATA_KEY);
    // Los tokens de Laravel Sanctum son strings simples, no JWTs
    return !!(token && user);
  }
};