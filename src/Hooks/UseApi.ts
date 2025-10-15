import { useState, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';
import type { ApiResponse, LoadingState } from '@/types/ApiTypes';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseApiReturn<T> extends LoadingState {
  data: T | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook personalizado para manejar llamadas a APIs
 * Proporciona estado de carga, manejo de errores y notificaciones automáticas
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiFunction(...args);

      if (response.success && response.data) {
        setData(response.data);
        
        // Mostrar toast de éxito si está habilitado
        if (options.showSuccessToast) {
          showToast({
            type: 'success',
            title: 'Operación exitosa',
            message: options.successMessage || response.message
          });
        }
        
        return response.data;
      } else {
        // La API retornó success: false
        const errorMsg = response.error || 'Error desconocido';
        setError(errorMsg);
        
        if (options.showErrorToast) {
          showToast({
            type: 'error',
            title: 'Error',
            message: options.errorMessage || errorMsg
          });
        }
        
        return null;
      }
    } catch (err) {
      // Error de red o excepción
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      
      if (options.showErrorToast) {
        showToast({
          type: 'error',
          title: 'Error de conexión',
          message: options.errorMessage || errorMsg
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, options, showToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  };
};

/**
 * Hook simplificado para formularios
 * Automatically maneja loading states y toast notifications
 */
export const useFormApi = <T = any>(
  submitFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  successMessage?: string
) => {
  return useApi(submitFunction, {
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: successMessage || 'Operación completada con éxito'
  });
};