/**
 * TableActionButtons - Helper para crear botones de acción de tabla consistentes
 * 
 * Este helper facilita la creación de acciones de tabla que usan el sistema
 * Button establecido, manteniendo consistencia con el resto de la aplicación, colores.
 */

import React from 'react';
import type { DataTableAction } from '../Ui/DataTable';

/**
 * Tipo de acción de tabla disponible
 */
type TableActionType = 'view' | 'edit' | 'delete';

/**
 * Configuración para crear una acción de tabla
 */
interface TableActionConfig<T> {
  type: TableActionType;
  icon: React.ReactNode;
  label: string;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
}

/**
 * Crea una acción de tabla usando el sistema Button establecido
 */
export const createTableAction = <T,>(config: TableActionConfig<T>): DataTableAction<T> => {
  const { type, icon, label, onClick, disabled } = config;
  
  return {
    icon,
    label,
    onClick,
    disabled,
    // Usar las clases que corresponden a nuestra variante del botón
    className: getTableActionClasses(type)
  };
};

/**
 * Obtiene las clases CSS correspondientes a cada tipo de acción
 * Estas clases replican las definidas en Button.tsx para las variantes table-*
 */
const getTableActionClasses = (type: TableActionType): string => {
  const baseClasses = 'bg-transparent border-0 p-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  switch (type) {
    case 'view':
      return `${baseClasses} text-green-600 hover:bg-green-50 hover:text-green-700`;
    case 'edit':
      return `${baseClasses} text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700`;
    case 'delete':
      return `${baseClasses} text-rojo-una hover:bg-red-50 hover:text-red-700`;
    default:
      return baseClasses;
  }
};

/**
 * Helper para crear múltiples acciones de tabla de forma rápida
 */
export const createTableActions = <T,>(configs: TableActionConfig<T>[]): DataTableAction<T>[] => {
  return configs.map(config => createTableAction(config));
};