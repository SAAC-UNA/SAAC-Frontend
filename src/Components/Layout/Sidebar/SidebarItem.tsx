import React, { useCallback, useEffect, useState } from 'react';
import type { NavItem } from '@/Types/CommonTypes';
import { cn } from '@/Utils/ClassNames';
import { useNavigationItems } from '@/Hooks/UseNavigation';
import { SidebarButton } from './SidebarButton';
import { SidebarIcon } from './SidebarIcon';
import { SidebarLabel } from './SidebarLabel';
import { SidebarChevron } from './SidebarChevron';
import { SidebarFlyoutMenu } from './SidebarFlyoutMenu';

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
 *  └─ [SidebarFlyoutMenu]   (wrapper hover — solo para items con hijos)
 *     └─ SidebarButton      (forma, altura fija, colores, curvas decorativas)
 *        ├─ <span>           (contenedor ícono + label)
 *        │  ├─ SidebarIcon   (tamaño del ícono, escala en hover)
 *        │  └─ SidebarLabel  (tipografía, truncado)
 *        └─ SidebarChevron   (flecha derecha — indica que tiene submenú)
 */
const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isSubItem = false,
  isCollapsed = false,
}) => {
  const { handleItemClick, isItemActive } = useNavigationItems();

  // El padre se muestra activo si él mismo o alguno de sus hijos está activo.
  // Necesario porque los hijos ya no viven en el sidebar (usan flyout).
  const isActive = isItemActive(item.id) ||
    Boolean(item.isExpandable && item.children?.some(child => isItemActive(child.id)));

  // Estado visual: el botón se ilumina si la ruta está activa, el flyout está abierto,
  // o el cursor está encima (hover). Click sigue siendo necesario para navegar.
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isVisuallyActive = isActive || flyoutOpen || hovered;

  /**
   * layoutCollapsed: versión retrasada de isCollapsed para el layout visual del botón.
   * Al colapsar espera a que el sidebar termine su animación antes de cambiar el padding,
   * así el contenido queda clippeado por overflow:hidden.
   * Al expandir aplica inmediatamente.
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
    // Items con hijos no navegan al hacer click — el flyout maneja la navegación
    if (!item.isExpandable) {
      handleItemClick(item.id, item.href, false);
    }
  }, [item.onClick, item.id, item.href, item.isExpandable, handleItemClick]);

  const button = (
    <div
      className={cn('relative', !layoutCollapsed && (isSubItem ? 'ml-3' : 'ml-1'))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SidebarButton isActive={isVisuallyActive} isCollapsed={layoutCollapsed} onClick={handleClick}>

        <span className={cn(
          'flex items-center flex-1 min-w-0 h-full relative z-10',
          layoutCollapsed ? 'gap-1 justify-center' : 'gap-3',
        )}>
          {item.icon && (
            <SidebarIcon icon={item.icon} isActive={isVisuallyActive} />
          )}
          <SidebarLabel label={item.label} isCollapsed={isCollapsed} isActive={isVisuallyActive} />
        </span>

        {/* Flecha derecha — indica que el ítem abre un submenú flotante */}
        {item.isExpandable && (
          <SidebarChevron isActive={isVisuallyActive} isCollapsed={isCollapsed} />
        )}

      </SidebarButton>
    </div>
  );

  // Items con hijos → flyout en hover (reemplaza tooltip y acordeón)
  // Items sin hijos → botón directo
  const content = (item.isExpandable && item.children?.length)
    ? <SidebarFlyoutMenu item={item} isCollapsed={isCollapsed} onOpenChange={setFlyoutOpen}>{button}</SidebarFlyoutMenu>
    : button;

  return (
    <div className={cn(isSubItem && isCollapsed && 'hidden')}>
      {content}
    </div>
  );
};

export const SidebarItem = React.memo(SidebarItemComponent);