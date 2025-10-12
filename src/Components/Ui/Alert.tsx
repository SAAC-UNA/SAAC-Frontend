/**
 * Alert - Componente para mostrar mensajes de estado del sistema
 * 
 * Ideal para:
 * - Errores del backend (HTTP 500, 404, etc.)
 * - Mensajes de éxito después de operaciones
 * - Información importante para el usuario
 * - Advertencias del sistema
 * 
 * Diseño inspirado en toast pero de posición fija en pantalla
 */

import React from 'react';
import { cn } from '@/utils/ClassNames';
import { SystemIcons } from './Icons/SystemIcons';
import { Button } from './Button';

export interface AlertProps {
  // Contenido
  title?: string;
  message: string;
  
  // Tipo de alerta (determina icono, colores y estilo)
  variant?: 'error' | 'success' | 'info' | 'warning';
  
  // Configuración visual
  dismissible?: boolean; // Si se puede cerrar
  className?: string;
  
  // Acciones
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = 'info',
  dismissible = true,
  className,
  onDismiss,
  action
}) => {
  
  // Configuración por variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'error':
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          defaultTitle: 'Error'
        };
      case 'success':
        return {
          icon: SystemIcons.interface.checkCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          defaultTitle: 'Éxito'
        };
      case 'warning':
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-l-yellow-500',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          defaultTitle: 'Advertencia'
        };
      case 'info':
      default:
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          defaultTitle: 'Información'
        };
    }
  };

  const config = getVariantConfig();
  const finalTitle = title || config.defaultTitle;

  return (
    <div className={cn(
      'border border-gray-200 rounded-lg shadow-sm',
      config.bgColor,
      config.borderColor,
      'border-l-4 p-4',
      className
    )}>
      <div className="flex items-start">
        {/* Icono */}
        <div className="flex-shrink-0">
          {config.icon({
            size: 'md',
            className: cn(config.iconColor, 'w-5 h-5')
          })}
        </div>
        
        {/* Contenido */}
        <div className="ml-3 flex-1">
          {/* Título */}
          <h3 className={cn(
            'text-sm font-medium',
            config.titleColor
          )}>
            {finalTitle}
          </h3>
          
          {/* Mensaje */}
          <div className={cn(
            'mt-1 text-sm',
            config.messageColor
          )}>
            {message}
          </div>
          
          {/* Acción opcional */}
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="text-xs px-3 py-1"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        
        {/* Botón de cerrar */}
        {dismissible && onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:bg-gray-100 transition-colors',
                config.iconColor,
                'focus:ring-gray-300'
              )}
            >
              <span className="sr-only">Cerrar</span>
              {SystemIcons.actions.cancel({
                size: 'sm',
                className: 'w-4 h-4'
              })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Variantes pre-configuradas para casos comunes
 */
export const AlertVariants = {
  // Error del backend
  backendError: (message: string, onRetry?: () => void) => (
    <Alert
      variant="error"
      title="Error del servidor"
      message={message}
      action={onRetry ? {
        label: "Reintentar",
        onClick: onRetry
      } : undefined}
    />
  ),
  
  // Operación exitosa
  success: (message: string, onDismiss?: () => void) => (
    <Alert
      variant="success"
      message={message}
      onDismiss={onDismiss}
    />
  ),
  
  // Error de conexión
  connectionError: (onRetry?: () => void) => (
    <Alert
      variant="error"
      title="Error de conexión"
      message="No se pudo conectar con el servidor. Verifica tu conexión a internet."
      action={onRetry ? {
        label: "Reintentar",
        onClick: onRetry
      } : undefined}
    />
  ),
  
  // Sin permisos
  unauthorized: () => (
    <Alert
      variant="warning"
      title="Acceso denegado"
      message="No tienes permisos para realizar esta acción."
      dismissible={false}
    />
  )
};