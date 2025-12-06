/**
 * TableActionButton - Componente reutilizable para botones de acción en tablas
 * 
 * Este componente estandariza los botones de acción de tabla, evitando duplicación
 * de código y asegurando consistencia visual y de comportamiento.
 * 
 * Características:
 * - Predefinido con tamaño y estilo consistente para tablas
 * - Tooltip integrado automáticamente
 * - Iconos del sistema centralizado
 * - Variantes específicas para cada tipo de acción
 */

import React from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ButtonWithTooltip } from './ButtonWithTooltip';

export type TableActionType = 'view' | 'edit' | 'delete' | 'power' | 'add' | 'upload' | 'uploadArrow' | 'search' | 'roles' | 'users' | 'custom';

interface TableActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Tipo de acción predefinida. Determina el icono y la variante del botón.
   */
  action: TableActionType;
  
  /**
   * Texto del tooltip que aparece al hacer hover
   */
  tooltip: string;
  
  /**
   * Función a ejecutar cuando se hace clic en el botón
   */
  onClick: () => void;
  
  /**
   * Para el botón de power, indica si está activo o inactivo
   */
  isActive?: boolean;
  
  /**
   * Icono personalizado. Si se proporciona, anula el icono predefinido
   */
  customIcon?: React.ReactNode;
  
  /**
   * Variante personalizada del botón. Si se proporciona, anula la variante predefinida
   */
  customVariant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'transparent' | 'success' | 'tableView' | 'tableEdit' | 'tableDelete' | 'tablePower' | 'tablePowerInactive';
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
  
  /**
   * Si el botón está deshabilitado
   */
  disabled?: boolean;
}

/**
 * Configuración por defecto para cada tipo de acción
 */
const actionConfig: Record<TableActionType, {
  icon: React.ReactNode;
  variant: string;
}> = {
  view: {
    icon: <SystemIcons.actions.view className="w-4 h-4" size="sm" />,
    variant: 'tableView'
  },
  edit: {
    icon: <SystemIcons.actions.edit className="w-4 h-4" size="sm" />,
    variant: 'tableEdit'
  },
  delete: {
    icon: <SystemIcons.actions.delete className="w-4 h-4" size="sm" />,
    variant: 'tableDelete'
  },
  power: {
    icon: <SystemIcons.actions.power className="w-4 h-4" size="sm" />,
    variant: 'tablePower'
  },
  add: {
    icon: <SystemIcons.actions.add className="w-4 h-4" size="sm" />,
    variant: 'tableEdit'
  },
  upload: {
    icon: <SystemIcons.interface.upload className="w-4 h-4" size="sm" />,
    variant: 'tableEdit'
  },
  uploadArrow: {
    icon: <SystemIcons.interface.uploadArrow className="w-4 h-4" size="sm" />,
    variant: 'tableEdit'
  },
  search: {
    icon: <SystemIcons.interface.search className="w-4 h-4" size="sm" />,
    variant: 'tableView'
  },
  roles: {
    icon: <SystemIcons.users.roles className="w-4 h-4" size="sm" />,
    variant: 'tableView'
  },
  users: {
    icon: <SystemIcons.users.user className="w-4 h-4" size="sm" />,
    variant: 'tableView'
  },
  custom: {
    icon: null,
    variant: 'tableView'
  }
};

export const TableActionButton = React.memo<TableActionButtonProps>(({
  action,
  tooltip,
  onClick,
  isActive,
  customIcon,
  customVariant,
  className = "h-8 w-8 p-2",
  disabled = false,
  ...props
}) => {
  // Obtener configuración base
  const config = actionConfig[action];
  
  // Determinar el icono a usar
  const icon = customIcon || config.icon;
  
  // Determinar la variante a usar
  let variant = customVariant || config.variant;
  
  // Para el botón de power, ajustar la variante según el estado
  if (action === 'power' && !customVariant) {
    variant = isActive ? 'tablePower' : 'tablePowerInactive';
  }
  
  return (
    <ButtonWithTooltip
      variant={variant as any}
      size="sm"
      tooltip={tooltip}
      onClick={onClick}
      className={className}
      disabled={disabled}
      {...props}
    >
      {icon}
    </ButtonWithTooltip>
  );
});