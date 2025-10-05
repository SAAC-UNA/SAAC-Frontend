/**
 * PageErrorState - Componente para errores de página completa
 * 
 * Maneja errores que afectan toda la página o sección principal,
 * como errores de carga, permisos, recursos no encontrados, etc.
 * Diferente de BackendErrorAlert que es para errores específicos.
 * 
 * Casos de uso:
 * - 404 - Página no encontrada
 * - 403 - Sin permisos
 * - 500 - Error del servidor
 * - Recursos no encontrados
 * - Errores de navegación
 */

import React from 'react';
import { Button } from './Button';
import { SystemIcons } from './Icons/SystemIcons';

interface PageErrorStateProps {
  /** Título del error */
  title?: string;
  /** Descripción del error */
  description?: string;
  /** Código de error (opcional) */
  errorCode?: string | number;
  /** Icono personalizado */
  icon?: React.ReactNode;
  /** Texto del botón principal */
  primaryActionLabel?: string;
  /** Función del botón principal */
  onPrimaryAction?: () => void;
  /** Texto del botón secundario */
  secondaryActionLabel?: string;
  /** Función del botón secundario */
  onSecondaryAction?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

export const PageErrorState: React.FC<PageErrorStateProps> = ({
  title = "Error",
  description = "Ha ocurrido un problema inesperado.",
  errorCode,
  icon,
  primaryActionLabel = "Volver a la lista",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ""
}) => {
  
  // Icono por defecto basado en tipo de error
  const getDefaultIcon = () => {
    if (errorCode === 404 || errorCode === '404') {
      return (
        <div className="relative">
          <SystemIcons.interface.alert className="h-16 w-16 text-[var(--icon-delete)]" />
        </div>
      );
    }
    
    if (errorCode === 403 || errorCode === '403') {
      return (
        <SystemIcons.interface.alert className="h-16 w-16 text-[var(--icon-warning)]" />
      );
    }
    
    // Error genérico
    return (
      <SystemIcons.interface.alert className="h-16 w-16 text-[var(--icon-delete)]" />
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-12 text-center ${className}`}>
      {/* Icono */}
      <div className="mb-6">
        {icon || getDefaultIcon()}
      </div>
      
      {/* Código de error (si existe) */}
      {errorCode && (
        <div className="mb-2">
          <span className="text-3xl font-bold text-gris-una/60">
            {errorCode}
          </span>
        </div>
      )}
      
      {/* Título */}
      <h1 className="text-2xl font-bold text-negro-una mb-4">
        {title}
      </h1>
      
      {/* Descripción */}
      <p className="text-gris-una text-base mb-8 max-w-lg leading-relaxed">
        {description}
      </p>
      
      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Botón principal */}
        {primaryActionLabel && (
          <Button
            variant="primary"
            onClick={onPrimaryAction || (() => window.history.back())}
            modalButton={true}
            size="sm"
          >
            {primaryActionLabel}
          </Button>
        )}
        
        {/* Botón secundario */}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            onClick={onSecondaryAction}
            modalButton={true}
            size="sm"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};