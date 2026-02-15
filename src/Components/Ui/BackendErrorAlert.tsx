/**
 * BackendErrorAlert - Manejo especializado de errores del backend SAAC
 * 
 * Detecta automáticamente tipos específicos de errores del backend Laravel
 * y muestra mensajes contextualizados con acciones apropiadas.
 * 
 * Basado en el análisis de errores comunes del backend SAAC:
 * - HTTP 500/503 (servidor)
 * - Errores de base de datos
 * - Errores de conexión de red
 * - HTTP 404/401 (recursos/autorización)
 * - Errores de memoria/recursos
 */

import React from 'react';
import { Alert } from './Alert';

interface BackendErrorAlertProps {
  error: string;
  onRetry?: () => void | Promise<void>;
  className?: string;
}

interface ErrorConfig {
  title: string;
  message: string;
  showRetryButton: boolean;
}

export const BackendErrorAlert: React.FC<BackendErrorAlertProps> = ({
  error,
  onRetry,
  className = ""
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  /**
   * Maneja el reintento con estado de carga
   */
  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Mantener el estado de "retrying" por un momento para evitar parpadeos
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  /**
   * Detecta el tipo de error y devuelve la configuración apropiada
   */
  const getErrorConfig = (errorMessage: string): ErrorConfig => {
    const lowerError = errorMessage.toLowerCase();

    // 1. Error HTTP 500 (Backend Laravel)
    if (lowerError.includes('http error! status: 500') || lowerError.includes('internal server error')) {
      return {
        title: 'Error del servidor',
        message: 'El servidor está experimentando problemas internos.',
        showRetryButton: true
      };
    }

    // 2. Error HTTP 503 (Servidor no disponible)
    if (lowerError.includes('http error! status: 503') || lowerError.includes('service unavailable')) {
      return {
        title: 'Servidor no disponible',
        message: 'El servidor está temporalmente fuera de servicio. Intente nuevamente en unos minutos.',
        showRetryButton: true
      };
    }

    // 3. Error de base de datos
    if (lowerError.includes('database connection') || 
        lowerError.includes('connection timeout') ||
        lowerError.includes('database error')) {
      return {
        title: 'Error de base de datos',
        message: 'No se pudo conectar con la base de datos. Verifique la conexión del servidor.',
        showRetryButton: true
      };
    }

    // 4. Error de red/conexión
    if (lowerError.includes('network error') || 
        lowerError.includes('connection') || 
        lowerError.includes('fetch')) {
      return {
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        showRetryButton: true
      };
    }

    // 5. Error 404 (Recurso no encontrado)
    if (lowerError.includes('http error! status: 404') || lowerError.includes('not found')) {
      return {
        title: 'Recurso no encontrado',
        message: 'La API de roles no está disponible. Contacta al administrador del sistema.',
        showRetryButton: true
      };
    }

    // 6. Error 401 (No autorizado)
    if (lowerError.includes('http error! status: 401') || lowerError.includes('unauthorized')) {
      return {
        title: 'Acceso no autorizado',
        message: 'Su sesión ha expirado o no tiene permisos para ver los roles.',
        showRetryButton: false // No mostrar retry porque requiere nueva autenticación
      };
    }

    // 7. Error de memoria/recursos
    if (lowerError.includes('memory limit') || 
        lowerError.includes('memory') ||
        lowerError.includes('timeout')) {
      return {
        title: 'Error del servidor',
        message: 'El servidor está experimentando problemas de recursos. Intente nuevamente.',
        showRetryButton: true
      };
    }

    // 8. Fallback - Error genérico
    return {
      title: 'Error inesperado',
      message: errorMessage || 'Ha ocurrido un error inesperado. Intente nuevamente.',
      showRetryButton: true
    };
  };

  const config = getErrorConfig(error);

  return (
    <div className={className}>
      <Alert
        variant="error"
        title={config.title}
        message={config.message}
        dismissible={false}
        action={config.showRetryButton && onRetry ? {
          label: isRetrying ? 'Reintentando...' : 'Reintentar',
          onClick: handleRetry
        } : undefined}
      />
    </div>
  );
};