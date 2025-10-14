/**
 * authService - Servicio de autenticación mock
 * Los datos de usuarios coinciden con el seeder del backend para simular
 * un ambiente similar al de producción.
 */

import { MOCK_USERS, type MockUser } from '@/Mocks/Users';

export type { MockUser as User };

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user';

export const authService = {
  loginWithCedula: async (cedula: string, password: string): Promise<{ user: MockUser; token: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validar formato de cédula (9 dígitos como en el backend)
    if (!/^\d{9}$/.test(cedula)) {
      throw new Error('La cédula debe tener 9 dígitos');
    }

    // Buscar usuario por cédula (datos del seeder)
    const user = MOCK_USERS.find(u => u.cedula === cedula);

    if (!user || password !== 'password') { // En desarrollo siempre es 'password'
      throw new Error('Credenciales incorrectas');
    }

    const mockToken = btoa(JSON.stringify({ 
      userId: user.usuario_id, 
      exp: Date.now() + 3600000 // 1 hora
    }));

    localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    return { user, token: mockToken };
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
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
};