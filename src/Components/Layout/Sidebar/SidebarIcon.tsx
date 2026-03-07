import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';
import { SIDEBAR_ITEM } from '@/Constants/Components';

interface SidebarIconProps {
  /** Nombre del ícono en formato 'system-icon:name' o directamente 'name' */
  icon: string;
  isActive: boolean;
}

/**
 * Ícono del sidebar
 * Responsabilidad: tamaño fijo del ícono y escala en hover.
 * El color lo hereda del botón padre (currentColor) según estado activo/inactivo.
 */
export const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, isActive }) => {
  const iconName = icon.replace('system-icon:', '');

  return (
    <span
      className={cn(
        'flex-shrink-0 relative flex items-center justify-center',
        SIDEBAR_ITEM.icon,
        'transition-[filter] duration-300 ease-out group-hover/btn:brightness-125',
        isActive ? 'text-rojo-una-2' : 'text-blanco-una-2',
      )}
    >
      {getIconByName(iconName, 'md')}
    </span>
  );
};
