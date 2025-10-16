/**
 * Constantes para URLs y configuración de API
 */

// URLs base
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    ME: '/auth/me' // Endpoint alternativo para obtener usuario actual con carreras
  },
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    PRIVILEGES: '/roles/privileges'
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`
  }
} as const;

// Configuración de peticiones
export const REQUEST_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
} as const;

// Estados de la aplicación
export const APP_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle'
} as const;