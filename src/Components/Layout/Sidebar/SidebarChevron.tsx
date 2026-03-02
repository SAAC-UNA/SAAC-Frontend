import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';

interface SidebarChevronProps {
  isExpanded: boolean;
  isActive: boolean;
  isCollapsed?: boolean;
}

/**
 * Flecha del sidebar para items expandibles
 * Responsabilidad: rotación animada según estado expandido/colapsado.
 * Usa transición de opacidad en lugar de desmontado para una animación fluida.
 */
export const SidebarChevron: React.FC<SidebarChevronProps> = ({ isExpanded, isActive, isCollapsed = false }) => {
  return (
    <span
      className={cn(
        'flex-shrink-0 ml-auto flex items-center justify-center overflow-visible',
        'transition-[transform,opacity,width] duration-150 relative z-10',
        isExpanded ? 'rotate-90' : 'rotate-180',
        isCollapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-100 w-5 h-5',
      )}
    >
      <div
        className={cn(
          'w-7 h-7 transition-all duration-200',
          isActive ? 'text-rojo-una-2' : 'text-blanco-una-2',
        )}
      >
        {getIconByName('caret-left', 'lg')}
      </div>
    </span>
  );
};
