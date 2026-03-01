import React, { useCallback } from 'react';
import type { NavItem } from '@/Types/CommonTypes';
import { cn } from '@/Utils/ClassNames';
import { useNavigationItems } from '@/Hooks/UseNavigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Tooltip';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';

interface ModernSidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  centered?: boolean;
  isCollapsed?: boolean;
}

const ModernSidebarItemComponent: React.FC<ModernSidebarItemProps> = ({ 
  item, 
  isSubItem = false,
  isCollapsed = false
}) => {
  const { handleItemClick, isItemActive, isItemExpanded } = useNavigationItems();

  const isExpanded = isItemExpanded(item.id);
  const isActive = isItemActive(item.id);

  const handleClick = useCallback(() => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    handleItemClick(item.id, item.href, item.isExpandable);
  }, [item.onClick, item.id, item.href, item.isExpandable, handleItemClick]);

  const buttonContent = (
    // ml-3 para padres, ml-6 para hijos (indentación de jerarquía)
    <div className={cn("relative", isSubItem ? "ml-6" : "ml-3")}>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center text-left transition-all duration-200 group w-full relative z-10',
          'rounded-l-[20px] text-sm font-medium cursor-pointer mb-1',
          isCollapsed ? 'p-2 justify-center' : 'px-4 py-4',
          isActive
            ? 'bg-blanco-una-2 text-rojo-una-2 font-semibold'
            : 'text-blanco-una-2 hover:bg-rojo-una/20',
        )}
      >
        {/* Fondo activo con curvas */}
        {isActive && !isCollapsed && (
          <div className="absolute inset-0 rounded-l-[20px] bg-blanco-una-2 pointer-events-none">
            <div
              className="absolute -top-5 right-0 w-5 h-5 rounded-full"
              style={{ boxShadow: '10px 10px 0 #f8f9fa' }}
            />
            <div
              className="absolute -bottom-5 right-0 w-5 h-5 rounded-full"
              style={{ boxShadow: '10px -10px 0 #f8f9fa' }}
            />
          </div>
        )}

        {/* Icono */}
        {item.icon && (
          <span className={cn(
            'flex-shrink-0 transition-transform duration-200 relative z-10',
            'w-5 h-5 flex items-center justify-center group-hover:scale-110',
            !isCollapsed && 'mr-3'
          )}>
            <div className={cn(
              "w-5 h-5 transition-all duration-200",
              isActive ? "text-rojo-una-2" : "text-blanco-una-2"
            )}>
              {getIconByName(item.icon.replace('system-icon:', ''), 'md')}
            </div>
          </span>
        )}

        {/* Label */}
        {!isCollapsed && (
          <span className="flex-1 truncate relative z-10">
            {item.label}
          </span>
        )}

        {/* Flecha - solo para items expandibles */}
        {item.isExpandable && !isCollapsed && (
          <span className={cn(
            'flex-shrink-0 ml-2 transition-transform duration-300 relative z-10',
            'w-5 h-5 flex items-center justify-center overflow-visible',
            isExpanded ? 'rotate-90' : 'rotate-180'
          )}>
            <div className={cn(
              "w-7 h-7 transition-all duration-200",
              isActive ? "text-rojo-una-2" : "text-blanco-una-2"
            )}>
              {getIconByName('caret-left', 'lg')}
            </div>
          </span>
        )}
      </button>
    </div>
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
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
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

// Memoizar componente para evitar re-renders innecesarios
export const ModernSidebarItem = React.memo(ModernSidebarItemComponent);