import React from 'react';
import type { NavItem } from '@/types/CommonTypes';
import { cn } from '@/utils/ClassNames';
import { useNavigationItems } from '@/hooks/UseNavigation';

import caretIcon from '@/assets/Icons/caret-left.svg';

interface SidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  centered?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  item, 
  isSubItem = false,
  centered = false
}) => {
  const { handleItemClick, isItemActive, isItemExpanded } = useNavigationItems();

  // Estado de expansión ahora viene del contexto global
  const isExpanded = isItemExpanded(item.id);

  // Debug temporal - eliminar después
  console.log('SidebarItem:', item.label, 'icon:', item.icon, 'type:', typeof item.icon);

  const handleClick = () => {
    // La lógica de expansión ahora está en el hook
    handleItemClick(item.id, item.href, item.isExpandable);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center text-left transition-all duration-200 group',
          // Control de ancho basado en el tamaño del sidebar
          centered ? 'sidebar-item-centered' : 'sidebar-item-width',
          // Estilos base
          'px-4 py-3 text-sm font-medium',
          // Estilos para items principales
          !isSubItem && 'mx-2 rounded-full',
          // Estilos para subitems
          isSubItem && 'ml-8 mr-2 rounded-lg',
          // Estados activo/inactivo
          isItemActive(item.id)
            ? 'bg-blanco-una text-rojo-una-2 font-semibold hover:translate-x-1'
            : 'text-blanco-una',
          // Hover effects
          !isItemActive(item.id) && 'hover:translate-x-1'
        )}
      >
        {/* Icono y contenedor */}
        <span className={cn(
          'flex-shrink-0 mr-3 transition-transform duration-200',
          'w-5 h-5 flex items-center justify-center',
          'group-hover:scale-110'
        )}>
          {/* (SVG/PNG) */}
          <img 
            src={item.icon} 
            alt={`${item.label} icon`} 
            className={cn(
              "w-5 h-5 object-contain transition-all duration-200",
              isItemActive(item.id) ? "icon-rojo-una-2" : "icon-blanco-una"
            )}
          />
        </span>

        {/* Label */}
        <span className="flex-1 truncate">
          {item.label}
        </span>

        {/* Arrow para items expandibles */}
        {item.isExpandable && (
          <span className={cn(
            'flex-shrink-0 ml-2 transition-transform duration-300',
            // Contenedor del mismo tamaño que los íconos principales 
            'w-5 h-5 flex items-center justify-center overflow-visible',
            // Rotación: derecha (>) cuando cerrado, abajo (v) cuando expandido
            isExpanded ? 'rotate-90' : 'rotate-180'
          )}>
            <img 
              src={caretIcon}
              alt="Expandir menú"
              className={cn(
                "w-7 h-7 object-contain transition-all duration-200",
                // Mismo sistema de colores que los otros íconos
                isItemActive(item.id) ? "icon-rojo-una-2" : "icon-blanco-una"
              )}
            />
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