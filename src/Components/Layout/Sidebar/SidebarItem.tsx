import React from 'react';
import type { NavItem } from '@/types/CommonTypes';
import { cn } from '@/utils/ClassNames';
import { useNavigationItems } from '@/hooks/UseNavigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/Ui/Tooltip';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';

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
    <div className={cn(
      "relative",
      // Margen izquierdo para items principales
      !isSubItem && "ml-3"
    )}>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center text-left transition-all duration-200 group w-full relative z-10',
          // Padding ajustado para estado colapsado
          isCollapsed ? 'p-2 justify-center' : 'px-4 py-4',
          'text-sm font-medium cursor-pointer mb-3',
          // Estilo con curvas para items principales
          !isSubItem && 'rounded-l-[20px]',
          // Estilos para subitems
          isSubItem && 'ml-8 mr-2 rounded-lg',
          // Estados activo/inactivo para items principales
          !isSubItem && (
            isActive 
              ? 'bg-blanco-una-2 text-rojo-una-2 font-semibold' // Activo: fondo blanco + texto rojo
              : 'text-blanco-una' // Inactivo: texto blanco
          ),
          // Estados activo/inactivo para subitems
          isSubItem && (
            isActive
              ? 'bg-blanco-una-2 text-rojo-una-2 font-semibold shadow-md'
              : 'text-blanco-una'
          ),
          // Hover effects solo para items inactivos
          !isActive && 'hover:bg-rojo-una/20'
        )}
      >
        {/* Fondo activo con curvas - solo para items principales */}
        {isActive && !isSubItem && !isCollapsed && (
          <div className="absolute inset-0 rounded-l-[20px] bg-blanco-una-2 pointer-events-none">
            {/* Curva superior */}
            <div 
              className="absolute -top-5 right-0 w-5 h-5 rounded-full"
              style={{
                boxShadow: '10px 10px 0 #f8f9fa'
              }}
            />
            {/* Curva inferior */}
            <div 
              className="absolute -bottom-5 right-0 w-5 h-5 rounded-full"
              style={{
                boxShadow: '10px -10px 0 #f8f9fa'
              }}
            />
          </div>
        )}
        
        {/* Icono */}
        <span className={cn(
          'flex-shrink-0 transition-transform duration-200 relative z-10',
          'w-5 h-5 flex items-center justify-center',
          'group-hover:scale-110',
          !isCollapsed && 'mr-3'
        )}>
          {item.icon.startsWith('system-icon:') ? (
            // Renderizar icono del sistema
            <div className={cn(
              "w-5 h-5 transition-all duration-200",
              isActive ? "text-rojo-una-2" : "text-blanco-una"
            )}>
              {getIconByName(item.icon.replace('system-icon:', ''), 'md')}
            </div>
          ) : (
            // Renderizar icono tradicional (SVG file)
            <img 
              src={item.icon} 
              alt={`${item.label} icon`} 
              className={cn(
                "w-5 h-5 object-contain transition-all duration-200",
                isActive ? "icon-rojo-una-2" : "icon-blanco-una"
              )}
            />
          )}
        </span>

        {/* Label - oculto cuando está colapsado */}
        {!isCollapsed && (
          <span className="flex-1 truncate relative z-10">
            {item.label}
          </span>
        )}

        {/* Arrow para items expandibles - oculto cuando está colapsado */}
        {item.isExpandable && !isCollapsed && (
          <span className={cn(
            'flex-shrink-0 ml-2 transition-transform duration-300 relative z-10',
            'w-5 h-5 flex items-center justify-center overflow-visible',
            isExpanded ? 'rotate-90' : 'rotate-180'
          )}>
            <div className={cn(
              "w-7 h-7 transition-all duration-200",
              isActive ? "text-rojo-una-2" : "text-blanco-una"
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