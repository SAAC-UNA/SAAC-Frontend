/**
 * Configuración global de la aplicación
 */

export const config = {
  // URL base del API del backend
  // IMPORTANTE: Usar 'localhost' (no 127.0.0.1) para que las cookies funcionen correctamente
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

  // URL pública del frontend para generar enlaces compartibles
  // Debe incluir puerto en local si el frontend corre en un puerto específico.
  FRONTEND_BASE_URL: (() => {
    const configured = import.meta.env.VITE_FRONTEND_URL?.trim();
    if (configured) {
      return configured.replace(/\/$/, '');
    }

    if (window.location.hostname === 'localhost' && !window.location.port) {
      return 'http://localhost:5173';
    }

    return window.location.origin.replace(/\/$/, '');
  })(),
  
  // Tiempos de espera
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Configuración de sesión
  SESSION_TIMEOUT: 1800000, // 30 minutos
};
