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
import { cn } from '@/Utils/ClassNames';
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
  
  // Configuración por variante usando variables CSS del sistema
  const getVariantConfig = () => {
    switch (variant) {
      case 'error':
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-[var(--color-error-light)]',
          borderColor: 'border-[var(--color-error-ring)]',
          iconColor: 'text-[var(--icon-delete)]',
          titleColor: 'text-error-dark',
          messageColor: 'text-error-dark',
          defaultTitle: 'Error'
        };
      case 'success':
        return {
          icon: SystemIcons.interface.checkCircle,
          bgColor: 'bg-[var(--color-verde-light)]',
          borderColor: 'border-[var(--color-verde-ring)]',
          iconColor: 'text-[var(--icon-check)]',
          titleColor: 'text-verde-dark',
          messageColor: 'text-verde-dark',
          defaultTitle: 'Éxito'
        };
      case 'warning':
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-[var(--color-warning-light)]',
          borderColor: 'border-[var(--color-warning-ring)]',
          iconColor: 'text-[var(--icon-alert)]',
          titleColor: 'text-warning-dark',
          messageColor: 'text-warning-dark',
          defaultTitle: 'Advertencia'
        };
      case 'info':
      default:
        return {
          icon: SystemIcons.interface.alert,
          bgColor: 'bg-[var(--color-info-light)]',
          borderColor: 'border-[var(--color-info-ring)]',
          iconColor: 'text-[var(--icon-info)]',
          titleColor: 'text-info-dark',
          messageColor: 'text-info-dark',
          defaultTitle: 'Información'
        };
    }
  };

  const config = getVariantConfig();
  const finalTitle = title || config.defaultTitle;

  return (
    <div className={cn(
      'p-4 border rounded-corner border-l-4 shadow-sm',
      config.bgColor,
      config.borderColor,
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
                variant="secondary"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        
        {/* Botón de cerrar */}
        {dismissible && onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              aria-label="Cerrar"
            >
              {SystemIcons.actions.cancel({
                size: 'sm',
                className: cn('w-4 h-4', config.iconColor)
              })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};