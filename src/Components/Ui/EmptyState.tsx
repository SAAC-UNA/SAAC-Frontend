/**
 * EmptyState - Componente para mostrar estados vacíos en listas y tablas
 * 
 * Ideal para:
 * - Tablas sin datos
 * - Búsquedas sin resultados
 * - Listas vacías
 * - Estados sin permisos
 * 
 * Diseño centrado con icono, título, descripción y acción opcional
 */

import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from './Icons/SystemIcons';
import { Button } from './Button';

export interface EmptyStateProps {
  // Contenido
  title?: string;
  description?: string;
  
  // Icono
  icon?: React.ReactNode;
  variant?: 'default' | 'search' | 'document' | 'noPermission';
  
  // Acción opcional
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  
  // Estilos
  className?: string;
  compact?: boolean; // Versión más compacta para espacios reducidos
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  variant = 'default',
  action,
  className,
  compact = false
}) => {
  
  // Configuración por variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          icon: <SystemIcons.interface.search className={cn(compact ? "w-10 h-10" : "w-12 h-12", "text-gray-300")} />,
          defaultTitle: 'Sin resultados',
          defaultDescription: 'No se encontraron resultados para tu búsqueda'
        };
      case 'document':
        return {
          icon: <SystemIcons.modal.document className={cn(compact ? "w-10 h-10" : "w-12 h-12", "text-gray-300")} />,
          defaultTitle: 'No hay datos',
          defaultDescription: 'No hay datos disponibles para mostrar'
        };
      case 'noPermission':
        return {
          icon: <SystemIcons.interface.alert className={cn(compact ? "w-10 h-10" : "w-12 h-12", "text-gray-300")} />,
          defaultTitle: 'Sin permisos',
          defaultDescription: 'No tienes permisos para ver este contenido'
        };
      case 'default':
      default:
        return {
          icon: <SystemIcons.modal.document className={cn(compact ? "w-10 h-10" : "w-12 h-12", "text-gray-300")} />,
          defaultTitle: 'No hay datos',
          defaultDescription: 'No hay información disponible'
        };
    }
  };

  const config = getVariantConfig();
  const finalIcon = icon || config.icon;
  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-gray-500",
      compact ? "py-8" : "py-12",
      className
    )}>
      {/* Icono */}
      <div className={cn(compact ? "mb-3" : "mb-4")}>
        {finalIcon}
      </div>
      
      {/* Título */}
      <p className={cn(
        "font-medium text-gray-900",
        compact ? "text-base mb-0.5" : "text-lg mb-1"
      )}>
        {finalTitle}
      </p>
      
      {/* Descripción */}
      {finalDescription && (
        <p className={cn(
          "text-gray-500",
          compact ? "text-xs" : "text-sm"
        )}>
          {finalDescription}
        </p>
      )}
      
      {/* Acción opcional */}
      {action && (
        <div className={cn(compact ? "mt-3" : "mt-4")}>
          <Button
            variant={action.variant || 'secondary'}
            size={compact ? 'sm' : 'md'}
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
