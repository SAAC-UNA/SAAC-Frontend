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
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';

export type TableActionType = 'view' | 'edit' | 'delete' | 'power' | 'add' | 'uploadArrow' | 'search' | 'roles' | 'users' | 'clock' | 'markComplete' | 'markInProgress' | 'approveRequest' | 'rejectRequest' | 'custom' | 'list' | 'comment';

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
  customVariant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'transparent' | 'success' | 'tableView' | 'tableEdit' | 'tableDelete' | 'tablePower' | 'tablePowerInactive' | 'tableList' | 'tableGris' | 'tableOrange';
  
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
    icon: <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableView'
  },
  edit: {
    icon: <SystemIcons.actions.edit className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableEdit'
  },
  delete: {
    icon: <SystemIcons.actions.delete className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableDelete'
  },
  power: {
    icon: <SystemIcons.actions.power className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tablePower'
  },
  add: {
    icon: <SystemIcons.actions.add className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableEdit'
  },
  uploadArrow: {
    icon: <SystemIcons.interface.uploadArrow className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableEdit'
  },
  search: {
    icon: <SystemIcons.interface.search className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableView'
  },
  roles: {
    icon: <SystemIcons.users.roles className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableView'
  },
  users: {
    icon: <SystemIcons.users.user className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableView'
  },
  clock: {
    icon: <SystemIcons.interface.hourglass className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableOrange'
  },
  markComplete: {
    icon: <SystemIcons.interface.checkCircle className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tablePower'
  },
  markInProgress: {
    icon: <SystemIcons.interface.inProgress className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tablePower'
  },  
  approveRequest: {
    icon: <SystemIcons.interface.checkCircle className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tablePower'
  },
  rejectRequest: {
    icon: <SystemIcons.interface.xCircle className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableDelete'
  },  
  custom: {
    icon: null,
    variant: 'tableView'
  },
  list: {
    icon: <SystemIcons.actions.list className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tableList'
  },
  comment: {
    icon: <SystemIcons.actions.comment className={TABLE_ACTION_BUTTON.icon} />,
    variant: 'tablePower'
  } 
};

export const TableActionButton = React.memo<TableActionButtonProps>(({
  action,
  tooltip,
  onClick,
  isActive,
  customIcon,
  customVariant,
  className = TABLE_ACTION_BUTTON.button,
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