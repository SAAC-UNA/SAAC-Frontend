import React, { useState } from 'react';
import type { NavItem } from '@/types/CommonTypes';
import { cn } from '@/utils/ClassNames';

interface SidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  item, 
  isSubItem = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.isExpandable) {
      setIsExpanded(prev => !prev);
    } else {
      // Aquí iría la navegación
      console.log(`Navegando a: ${item.href}`);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center text-left transition-all duration-200 group',
          // Estilos base
          'px-4 py-3 text-sm font-medium',
          // Estilos para items principales
          !isSubItem && 'mx-2 rounded-full',
          // Estilos para subitems
          isSubItem && 'ml-8 mr-2 rounded-lg',
          // Estados activo/inactivo
          item.isActive
            ? 'bg-white text-red-600 shadow-sm font-semibold'
            : 'text-white hover:bg-white/10',
          // Hover effects
          !item.isActive && 'hover:translate-x-1 hover:shadow-md'
        )}
      >
        {/* Icono */}
        <span className={cn(
          'flex-shrink-0 text-lg mr-3 transition-transform duration-200',
          'group-hover:scale-110'
        )}>
          {item.icon}
        </span>

        {/* Label */}
        <span className="flex-1 truncate">
          {item.label}
        </span>

        {/* Arrow para items expandibles */}
        {item.isExpandable && (
          <span className={cn(
            'flex-shrink-0 ml-2 transition-transform duration-300 text-xs',
            isExpanded ? 'rotate-90' : 'rotate-0'
          )}>
            ▶
          </span>
        )}
      </button>

      {/* Submenu */}
      {item.isExpandable && item.children && (
        <div className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-2 space-y-1">
            {item.children.map(child => (
              <SidebarItem 
                key={child.id} 
                item={child} 
                isSubItem={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};