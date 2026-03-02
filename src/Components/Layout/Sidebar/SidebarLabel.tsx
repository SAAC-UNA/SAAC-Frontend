import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface SidebarLabelProps {
  label: string;
  isCollapsed?: boolean;
}

/**
 * Texto del sidebar
 * Responsabilidad: tipografía y truncado del label.
 * Totalmente independiente de la altura del botón y del tamaño del ícono.
 * Usa transición de opacidad en lugar de desmontado para una animación fluida.
 */
export const SidebarLabel: React.FC<SidebarLabelProps> = ({ label, isCollapsed = false }) => {
  return (
    <span className={cn(
      'truncate transition-[opacity,max-width] duration-300 ease-in-out',
      TYPOGRAPHY.sidebarItem,
      isCollapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100 max-w-full'
    )}>
      {label}
    </span>
  );
};
