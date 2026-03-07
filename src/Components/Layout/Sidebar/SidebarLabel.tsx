import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface SidebarLabelProps {
  label: string;
  isCollapsed?: boolean;
  isActive?: boolean;
}

/**
 * Texto del sidebar
 * Responsabilidad: tipografía y truncado del label.
 * Totalmente independiente de la altura del botón y del tamaño del ícono.
 * Usa transición de opacidad en lugar de desmontado para una animación fluida.
 */
export const SidebarLabel: React.FC<SidebarLabelProps> = ({ label, isCollapsed = false, isActive = false }) => {
  return (
    <span className={cn(
      'truncate transition-[opacity,max-width,filter] duration-300 ease-in-out',
      'group-hover/btn:brightness-125',
      TYPOGRAPHY.sidebarItem,
      isActive ? 'text-rojo-una-2' : 'text-blanco-una-2',
      isCollapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100 max-w-full',
    )}>
      {label}
    </span>
  );
};
