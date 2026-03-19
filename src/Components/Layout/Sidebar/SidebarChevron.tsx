import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';

interface SidebarChevronProps {
  isActive: boolean;
  isCollapsed?: boolean;
}

/**
 * Indicador de submenú flotante.
 * Muestra una flecha derecha (→) cuando el sidebar está expandido
 * para indicar que el ítem abre un flyout al hacer hover.
 * Se oculta cuando el sidebar está colapsado (modo ícono).
 */
export const SidebarChevron: React.FC<SidebarChevronProps> = ({ isActive, isCollapsed = false }) => {
  return (
    <span
      className={cn(
        'flex-shrink-0 ml-auto flex items-center justify-center overflow-visible',
        'transition-[opacity,width] duration-300 ease-in-out relative z-10',
        isCollapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-60 w-5 h-5',
      )}
    >
      <div
        className={cn(
          'w-4 h-4',
          isActive ? 'text-rojo-una-2' : 'text-blanco-una-2',
        )}
      >
        {getIconByName('chevron-right', 'sm')}
      </div>
    </span>
  );
};
