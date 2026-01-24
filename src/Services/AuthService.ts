/**
 * authService - Servicio de autenticación
 * Conecta con el backend real de Laravel para obtener tokens Sanctum válidos.
 */

import { axiosInstance } from '@/Config/axios';
import type { MockUser } from '@/Mocks/Users';

export type { MockUser as User };

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user';

export const authService = {
  loginWithCedula: async (cedula: string, password: string): Promise<{ user: MockUser; token: string }> => {
    // Validar formato de cédula (9 dígitos como en el backend)
    if (!/^\d{9}$/.test(cedula)) {
      throw new Error('La cédula debe tener 9 dígitos');
    }

    try {
      // Login real contra el backend usando autenticación LDAP
      console.log('Enviando request a /auth/login con:', { cedula, password: '***' });
      const response = await axiosInstance.post('/auth/login', {
        cedula,
        password
      });

      console.log('Respuesta del backend:', response.data);
      const { token, user: backendUser } = response.data;

      // Mapear la respuesta del backend al formato del frontend
      const user: MockUser = {
        usuario_id: backendUser.id,
        cedula: backendUser.cedula,
        nombre: backendUser.name,
        email: backendUser.email,
        roles: backendUser.roles.map((role: any) => ({ 
          id: role.id, 
          name: role.name 
        })),
        careers: backendUser.careers || [],
        permissions: backendUser.permissions || []
      };

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return { user, token };
    } catch (error: any) {
      console.error('Error en login LDAP:', error);
      console.error('Detalles del error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  getCurrentUser: (): MockUser | null => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(USER_DATA_KEY);
    // Los tokens de Laravel Sanctum son strings simples, no JWTs
    return !!(token && user);
  }
};