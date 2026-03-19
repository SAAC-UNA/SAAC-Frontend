import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';
import type { NavItem } from '@/Types/CommonTypes';
import { useNavigationItems } from '@/Hooks/UseNavigation';

interface SidebarFlyoutMenuProps {
  /** El ítem padre cuyos hijos se mostrarán en el flyout */
  item: NavItem;
  /** El botón que actúa como trigger del flyout */
  children: React.ReactNode;
  /** Callback invocado cuando el flyout abre o cierra — permite al padre reaccionar visualmente */
  onOpenChange?: (open: boolean) => void;
  /** Estado colapsado del sidebar — necesario para bloquear el flyout durante transiciones */
  isCollapsed?: boolean;
}

/**
 * SidebarFlyoutMenu — Menú flotante activado por hover.
 *
 * Al pasar el cursor sobre el trigger, muestra un panel a la derecha
 * con los ítems hijos del NavItem. El panel permanece abierto mientras
 * el cursor esté sobre el trigger O sobre el panel mismo.
 *
 * Técnica de "shared timer": un único timeout de cierre compartido entre
 * trigger y panel evita que el menú parpadee al mover el mouse en diagonal.
 *
 * Reutilizable fuera del sidebar: recibe cualquier `NavItem` con `children`
 * y cualquier `children` como trigger.
 */
export const SidebarFlyoutMenu: React.FC<SidebarFlyoutMenuProps> = ({ item, children, onOpenChange, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = useCallback((value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  }, [onOpenChange]);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Rastrea si el cursor está encima del trigger en cualquier momento.
  const isHoveringRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuando isCollapsed cambia, cerrar el flyout y esperar a que la animación CSS termine.
  // Al finalizar, si el cursor sigue encima del trigger, re-abrir con las coordenadas correctas.
  const prevIsCollapsed = useRef(isCollapsed);
  useEffect(() => {
    if (prevIsCollapsed.current === isCollapsed) return;
    prevIsCollapsed.current = isCollapsed;

    setOpen(false);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      // Si el cursor nunca salió del trigger, re-abrir ahora que el sidebar terminó de animar
      if (isHoveringRef.current && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const estimatedHeight = (item.children?.length ?? 0) * 44 + 56;
        const clampedTop = Math.min(rect.top, window.innerHeight - estimatedHeight - 8);
        setPosition({ top: Math.max(clampedTop, 8), left: rect.right + 8 });
        setOpen(true);
      }
    }, 350);
  }, [isCollapsed, setOpen, item.children]);

  const { handleItemClick, isItemActive } = useNavigationItems();

  const clearClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  }, [clearClose, setOpen]);

  const handleTriggerEnter = useCallback(() => {
    isHoveringRef.current = true;
    clearClose();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const estimatedHeight = (item.children?.length ?? 0) * 44 + 56;
      const clampedTop = Math.min(rect.top, window.innerHeight - estimatedHeight - 8);
      setPosition({ top: Math.max(clampedTop, 8), left: rect.right + 8 });
    }
    setOpen(true);
  }, [clearClose, setOpen, item.children]);

  const handleTriggerLeave = useCallback(() => {
    isHoveringRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const handleChildClick = useCallback((child: NavItem) => {
    setOpen(false);
    handleItemClick(child.id, child.href, false);
  }, [setOpen, handleItemClick]);

  // Limpiar timers al desmontar
  useEffect(() => () => {
    clearClose();
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
  }, [clearClose]);

  return (
    <div ref={triggerRef} onMouseEnter={handleTriggerEnter} onMouseLeave={handleTriggerLeave}>
      {children}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -8, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onMouseEnter={clearClose}
              onMouseLeave={scheduleClose}
              style={{ top: position.top, left: position.left }}
              className={cn(
                'fixed z-50 min-w-[200px] max-w-[260px]',
                'rounded-tr-[var(--radius-lg)] rounded-br-[var(--radius-lg)] rounded-bl-[var(--radius-lg)]',
                'bg-rojo-una-2 shadow-2xl overflow-hidden',
              )}
            >
              {/* Ítems hijos */}
              <div className="py-1 px-1">
                {item.children?.map(child => {
                  const isActive = isItemActive(child.id);
                  const iconName = child.icon?.replace('system-icon:', '');

                  return (
                    <button
                      key={child.id}
                      onClick={() => handleChildClick(child)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer',
                        'transition-colors duration-150 rounded-corner',
                        isActive
                          ? 'bg-blanco-una/20 text-blanco-una font-semibold'
                          : 'text-blanco-una-2 hover:bg-blanco-una/10 hover:text-blanco-una',
                        TYPOGRAPHY.sidebarItem,
                      )}
                    >
                      {iconName && (
                        <span className={cn('flex-shrink-0 flex items-center justify-center', ICON_SIZES.sm)}>
                          {getIconByName(iconName, 'sm')}
                        </span>
                      )}
                      <span className="truncate">{child.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
