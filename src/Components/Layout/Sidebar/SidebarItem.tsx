import React, { useCallback, useEffect, useState } from 'react';
import type { NavItem } from '@/Types/CommonTypes';
import { cn } from '@/Utils/ClassNames';
import { useNavigationItems } from '@/Hooks/UseNavigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Feedback/Tooltip';
import { SidebarButton } from './SidebarButton';
import { SidebarIcon } from './SidebarIcon';
import { SidebarLabel } from './SidebarLabel';
import { SidebarChevron } from './SidebarChevron';

interface SidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  isCollapsed?: boolean;
}

/**
 * SidebarItem — compositor
 * Responsabilidad: lógica de estado (activo/expandido) y composición de sub-componentes.
 * No contiene estilos visuales directos — eso lo delega a cada hijo.
 *
 *  SidebarItem
 *  └─ SidebarButton     (forma, altura fija, colores, curvas decorativas)
 *     ├─ <span>          (contenedor ícono + label, siempre juntos)
 *     │  ├─ SidebarIcon  (tamaño del ícono, escala en hover)
 *     │  └─ SidebarLabel (tipografía, truncado)
 *     └─ SidebarChevron  (flecha animada, solo en expandibles)
 */
const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isSubItem = false,
  isCollapsed = false,
}) => {
  const { handleItemClick, isItemActive, isItemExpanded } = useNavigationItems();

  const isActive   = isItemActive(item.id);
  const isExpanded = isItemExpanded(item.id);

  /**
   * layoutCollapsed: versión retrasada de isCollapsed para el layout visual del botón.
   * - Al colapsar: espera 300ms (duración de la animación del sidebar) antes de cambiar
   *   el padding/gap/márgenes, así el contenido queda clippeado por overflow:hidden en vez
   *   de encogerse antes que el contenedor.
   * - Al expandir: aplica inmediatamente para que el botón se expanda junto con el sidebar.
   */
  const [layoutCollapsed, setLayoutCollapsed] = useState(() => isCollapsed);
  useEffect(() => {
    const timer = setTimeout(() => setLayoutCollapsed(isCollapsed), isCollapsed ? 320 : 0);
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const handleClick = useCallback(() => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    handleItemClick(item.id, item.href, item.isExpandable);
  }, [item.onClick, item.id, item.href, item.isExpandable, handleItemClick]);

  const buttonContent = (
    // ml-3 para padres, ml-6 para hijos; sin margen cuando colapsado (modo ícono)
    <div className={cn('relative', !layoutCollapsed && (isSubItem ? 'ml-3' : 'ml-1'), layoutCollapsed && 'mx-1')}>
      <SidebarButton isActive={isActive} isCollapsed={layoutCollapsed} onClick={handleClick}>

        {/* Ícono siempre visible — no se mueve con hover, solo el label lo hace */}
        <span className={cn('flex items-center flex-1 min-w-0 h-full relative z-10', layoutCollapsed ? 'gap-1 justify-center' : 'gap-3')}>
          {item.icon && (
            <SidebarIcon icon={item.icon} isActive={isActive} />
          )}
          <SidebarLabel label={item.label} isCollapsed={isCollapsed} isActive={isActive} />
        </span>

        {/* Flecha solo en expandibles: también en z-[1] para estar sobre el fondo */}
        {item.isExpandable && (
          <SidebarChevron isExpanded={isExpanded} isActive={isActive} isCollapsed={isCollapsed} />
        )}

      </SidebarButton>
    </div>
  );

  // Tooltip cuando el sidebar está colapsado
  const button = isCollapsed && !isSubItem ? (
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
    <div className={cn(isSubItem && isCollapsed && 'hidden')}>
      {button}

      {/* Submenu */}
      {item.isExpandable && item.children && !isCollapsed && (
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          isExpanded
            ? 'max-h-96 opacity-100 overflow-visible'
            : 'max-h-0 opacity-0 overflow-hidden',
        )}>
          <div className="py-2 space-y-1">
            {item.children.map(child => (
              <SidebarItem
                key={child.id}
                item={child}
                isSubItem
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SidebarItem = React.memo(SidebarItemComponent);