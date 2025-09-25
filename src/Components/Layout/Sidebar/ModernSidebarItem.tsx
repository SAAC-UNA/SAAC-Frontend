import React from 'react';
import type { NavItem } from '@/types/CommonTypes';
import { cn } from '@/utils/ClassNames';
import { useNavigationItems } from '@/hooks/UseNavigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/Ui/Tooltip';

import caretIcon from '@/assets/Icons/caret-left.svg';

interface ModernSidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  centered?: boolean;
  isCollapsed?: boolean;
}

export const ModernSidebarItem: React.FC<ModernSidebarItemProps> = ({ 
  item, 
  isSubItem = false,
  isCollapsed = false
}) => {
  const { handleItemClick, isItemActive, isItemExpanded } = useNavigationItems();

  const isExpanded = isItemExpanded(item.id);
  const isActive = isItemActive(item.id);

  const handleClick = () => {
    handleItemClick(item.id, item.href, item.isExpandable);
  };

  const buttonContent = (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center text-left transition-all duration-200 group w-full',
        // Padding ajustado para estado colapsado
        isCollapsed ? 'p-2 justify-center' : 'px-4 py-3',
        'text-sm font-medium',
        // Estilos para items principales
        !isSubItem && 'mx-2 rounded-full',
        // Estilos para subitems
        isSubItem && 'ml-8 mr-2 rounded-lg',
        // Estados activo/inactivo
        isActive
          ? 'bg-blanco-una text-rojo-una-2 font-semibold hover:translate-x-1'
          : 'text-blanco-una',
        // Hover effects
        !isActive && 'hover:translate-x-1 hover:bg-rojo-una/20'
      )}
    >
      {/* Icono */}
      <span className={cn(
        'flex-shrink-0 transition-transform duration-200',
        'w-5 h-5 flex items-center justify-center',
        'group-hover:scale-110',
        !isCollapsed && 'mr-3'
      )}>
        <img 
          src={item.icon} 
          alt={`${item.label} icon`} 
          className={cn(
            "w-5 h-5 object-contain transition-all duration-200",
            isActive ? "icon-rojo-una-2" : "icon-blanco-una"
          )}
        />
      </span>

      {/* Label - oculto cuando está colapsado */}
      {!isCollapsed && (
        <span className="flex-1 truncate">
          {item.label}
        </span>
      )}

      {/* Arrow para items expandibles - oculto cuando está colapsado */}
      {item.isExpandable && !isCollapsed && (
        <span className={cn(
          'flex-shrink-0 ml-2 transition-transform duration-300',
          'w-5 h-5 flex items-center justify-center overflow-visible',
          isExpanded ? 'rotate-90' : 'rotate-180'
        )}>
          <img 
            src={caretIcon}
            alt="Expandir menú"
            className={cn(
              "w-7 h-7 object-contain transition-all duration-200",
              isActive ? "icon-rojo-una-2" : "icon-blanco-una"
            )}
          />
        </span>
      )}
    </button>
  );

  // Si está colapsado y no es un subitem, mostrar tooltip
  const shouldShowTooltip = isCollapsed && !isSubItem;

  const button = shouldShowTooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonContent}
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        {item.label}
      </TooltipContent>
    </Tooltip>
  ) : buttonContent;

  return (
    <div className={cn(
      // Ocultar subitems cuando está colapsado
      isSubItem && isCollapsed && 'hidden'
    )}>
      {button}

      {/* Submenu - oculto cuando está colapsado */}
      {item.isExpandable && item.children && !isCollapsed && (
        <div className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-2 space-y-1">
            {item.children.map(child => (
              <ModernSidebarItem 
                key={child.id} 
                item={child} 
                isSubItem={true}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};