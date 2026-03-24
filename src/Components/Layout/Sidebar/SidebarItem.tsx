import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { NavItem } from '@/Types/CommonTypes';
import { cn } from '@/Utils/ClassNames';
import { useNavigationItems } from '@/Hooks/UseNavigation';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';
import { SidebarNavContext } from './SidebarNavContext';
import { SIDEBAR_ITEM } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface SidebarItemProps {
  item: NavItem;
  isSubItem?: boolean;
  isCollapsed?: boolean;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({
  item,
  isSubItem = false,
  isCollapsed = false,
}) => {
  const { handleItemClick, isItemActive } = useNavigationItems();
  const { setHoveredItem, selectedItemId } = useContext(SidebarNavContext);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isActive = isItemActive(item.id) ||
    Boolean(item.isExpandable && item.children?.some(child => isItemActive(child.id)));

  // Visualmente activo cuando la ruta coincide O cuando su panel está abierto
  const isExpandable = Boolean(item.isExpandable && item.children?.length);
  const isFlyoutOpen = isExpandable && selectedItemId === item.id;

  /**
   * layoutCollapsed: versión retrasada de isCollapsed.
   * Al colapsar espera a que el sidebar termine su animación antes de cambiar el padding.
   * Al expandir aplica inmediatamente.
   */
  const [layoutCollapsed, setLayoutCollapsed] = useState(() => isCollapsed);
  useEffect(() => {
    const timer = setTimeout(() => setLayoutCollapsed(isCollapsed), isCollapsed ? 320 : 0);
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (item.onClick) { item.onClick(); return; }
    if (!item.isExpandable) handleItemClick(item.id, item.href, false);
  }, [item, handleItemClick]);

  const iconName = item.icon?.replace('system-icon:', '');

  const showAnimatedBackground = isHovered || isFlyoutOpen;

  return (
    <div className={cn(isSubItem && isCollapsed && 'hidden')}>
      <div
        ref={triggerRef}
        className={cn('relative', !layoutCollapsed && isSubItem && 'ml-3')}
        onMouseEnter={() => {
          setIsHovered(true);
          if (isExpandable) setHoveredItem(item, triggerRef.current);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isExpandable) setHoveredItem(null);
        }}
      >
        <button
          onClick={handleClick}
          className={cn(
            'group/btn flex items-center text-left rounded-lg font-medium cursor-pointer relative z-10',
            'transition-colors duration-200',
            layoutCollapsed
              ? 'w-[var(--sidebar-width-icon)] h-sidebar-item px-2 justify-center'
              : `w-full ${SIDEBAR_ITEM.button} gap-1 justify-start`,
            // Fondo estático SOLO si está activo (ruta elegida) y NO se está interactuando con él (hover ni flyout abierto)
            (isActive && !showAnimatedBackground)
              ? 'bg-negro-una/20 text-blanco-una'
              : (isActive || showAnimatedBackground)
                ? 'text-blanco-una'
                : 'text-blanco-una-2 hover:text-blanco-una'
          )}
        >
          {/* Fondo deslizable animado */}
          {showAnimatedBackground && (
            <motion.div
              layoutId="sidebar-hover-indicator"
              className="absolute inset-0 bg-negro-una/20 rounded-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
            />
          )}
          {iconName && (
            <span className={cn('flex-shrink-0 flex items-center justify-center', SIDEBAR_ITEM.icon)}>
              {getIconByName(iconName, 'md')}
            </span>
          )}

          <motion.span
            animate={{
              display: layoutCollapsed ? 'none' : 'inline-block',
              opacity: layoutCollapsed ? 0 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn('flex-1 truncate whitespace-pre', TYPOGRAPHY.sidebarItem)}
          >
            {item.label}
          </motion.span>

          {isExpandable && !layoutCollapsed && (
            <motion.span
              animate={{ rotate: isFlyoutOpen ? 0 : 90 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex-shrink-0 ml-auto w-4 h-4 opacity-60 flex items-center justify-center"
            >
              {getIconByName('chevron-right', 'sm')}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
};

export const SidebarItem = React.memo(SidebarItemComponent);