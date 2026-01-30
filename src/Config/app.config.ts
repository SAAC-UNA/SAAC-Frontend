/**
 * Configuración global de la aplicación
 */

export const config = {
  // URL base del API del backend
  // Lee desde variable de entorno o usa valor por defecto
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Tiempos de espera
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Configuración de sesión
  SESSION_TIMEOUT: 1800000, // 30 minutos
};
