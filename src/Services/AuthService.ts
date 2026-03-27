/**
 * authService - Servicio de autenticación
 * Conecta con el backend (LDAP) para autenticar usuarios
 */

import { config } from "@/Config/app.config";
import { axiosInstance } from "@/Config/axios";

export class ValidationError extends Error {
  messages: string[];
  constructor(messages: string[]) {
    super(messages[0]);
    this.name = "ValidationError";
    this.messages = messages;
  }
}

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

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "auth_user";
const SESSION_EXPIRATION_KEY = 'session_expiration';

export const authService = {
  loginWithCedula: async (
    cedula: string,
    password: string,
  ): Promise<{ user: User; token: string; session_lifetime: number }> => {
    try {
      // Validar que los campos no estén vacíos
      if (!cedula.trim() || !password.trim()) {
        throw new Error("La cédula y contraseña son obligatorias");
      }

      // PASO 1: Obtener cookie CSRF de Laravel Sanctum
      await fetch(
        `${config.API_BASE_URL.replace("/api", "")}/sanctum/csrf-cookie`,
        {
          method: "GET",
          credentials: "include", // Incluir cookies
        },
      );

      // PASO 2: Realizar login (con cookie CSRF ya seteada)
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // Incluir cookies (CSRF + recibir auth_token)
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          cedula: cedula.trim(),
          password: password.trim(),
        }),
      });

      // Manejar errores HTTP
      if (!response.ok) {
        let errorMessage =
          "Credenciales incorrectas. Intente de nuevo o contacte al administrador.";

        try {
          const errorData = await response.json();
          if (errorData.errors) {
            const messages = Object.values(
              errorData.errors as Record<string, string[]>,
            ).flat();
            throw new ValidationError(messages);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          if (parseError instanceof ValidationError) throw parseError;
          // Si no se puede parsear el JSON, usar mensaje genérico
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const data = await response.json();

      if (!data.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Guardar el tiempo de expiración de la sesión
      if (data.session_lifetime) {
        const expirationTime = new Date().getTime() + data.session_lifetime * 1000;
        sessionStorage.setItem(SESSION_EXPIRATION_KEY, expirationTime.toString());
      }

      // Persistencia por pestaña: sobrevive refresh, pero no una pestaña nueva.
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

      return {
        user: data.user,
        token: "", // Ya no se usa, está en cookie
        session_lifetime: data.session_lifetime,
      };
    } catch (error) {
      // Re-lanzar el error para que el componente lo maneje
      throw error instanceof Error
        ? error
        : new Error("Error desconocido al iniciar sesión");
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Llamar al backend para limpiar la cookie
      await fetch(`${config.API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Enviar cookie para autenticación
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar almacenamiento de sesión/local heredado
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem(SESSION_EXPIRATION_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  },

  /**
   * Cierra la sesión y redirige al login con un mensaje.
   * Usado por el interceptor de Axios cuando la sesión expira.
   */
  logoutAndRedirect: (): void => {
    authService.logout(); // Limpia el estado local
    // Redirige a login con mensaje de sesión expirada
    const loginUrl = `/login?session_expired=true`;
    // Usamos `window.location.href` para forzar un refresco completo de la app
    // y así limpiar cualquier estado en memoria (React, etc.)
    if (window.location.pathname !== "/login") {
      window.location.href = loginUrl;
    }
  },

  /**
   * Obtiene el tiempo de expiración de la sesión desde sessionStorage.
   */
  getSessionExpiration: (): number | null => {
    const expirationTime = sessionStorage.getItem(SESSION_EXPIRATION_KEY);
    return expirationTime ? parseInt(expirationTime, 10) : null;
  },

  /**
   * Verifica si la sesión de cookie actual es válida contra el backend.
   * @returns {Promise<User|null>} El usuario si la sesión es válida, sino null.
   */
  checkAuthStatus: async (): Promise<User | null> => {
    try {
      // Endpoint protegido que devuelve el usuario autenticado
      const response = await axiosInstance.get("/user");
      const user = response.data;

      if (user) {
        // Actualizar datos del usuario en sessionStorage
        sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      // Si hay error (401, 419, etc.), la sesión no es válida
      return null;
    }
  },

  getCurrentUser: (): User | null => {
    const userData = sessionStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getAuthToken: (): string | null => {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const user = sessionStorage.getItem(USER_DATA_KEY);
    // El token está en httpOnly cookie, solo verificamos el usuario
    return !!user;
  },
};
