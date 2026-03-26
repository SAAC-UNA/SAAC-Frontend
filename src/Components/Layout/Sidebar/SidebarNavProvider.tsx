import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { NavItem } from '@/Types/CommonTypes';
import { SidebarNavContext } from './SidebarNavContext';
import { useNavigationItems } from '@/Hooks/UseNavigation';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { getIconByName } from '@/Components/Ui/Icons/SystemIcons';

interface SidebarNavProviderProps {
  children: React.ReactNode;
  /** Cuando cambia, el panel se cierra (sidebar transitioning) */
  isCollapsed?: boolean;
}

/**
 * SidebarNavProvider — Panel flotante ÚNICO compartido entre todos los ítems.
 *
 * Arquitectura inspirada en ShiftingDropDown:
 * - Un solo panel en el DOM (via portal) que PERMANECE ABIERTO al moverse entre ítems.
 * - El Nub (rombo) se desplaza suavemente al ítem trigger con motion.animate.
 * - El contenido transiciona con slide direccional (up/down) al cambiar de ítem.
 * - Shared timer: bridge invisible + 150ms delay evitan parpadeo al cruzar el gap.
 */
export const SidebarNavProvider: React.FC<SidebarNavProviderProps> = ({ children, isCollapsed }) => {
  const [selectedItem, setSelectedItem] = useState<NavItem | null>(null);
  const [hoveredChildId, setHoveredChildId] = useState<string | null>(null);
  const [dir, setDir] = useState<'up' | 'down' | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  // Refs para no incluir como dependencias en callbacks
  const selectedItemRef = useRef<NavItem | null>(null);
  const lastItemYRef = useRef<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard: bloquea la apertura del flyout mientras el sidebar está animando su ancho.
  // Necesario porque getBoundingClientRect() devuelve coordenadas intermedias durante
  // la transición CSS, lo que posiciona el panel dentro del sidebar.
  const isTransitioningRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Almacena el hover que llegó mientras el sidebar transitaba.
  // Se ejecuta automáticamente al terminar la animación.
  const pendingHoverRef = useRef<{ item: NavItem; triggerEl: HTMLElement } | null>(null);
  // 320ms = duración de la transición de ancho del sidebar (duration-300 + margen)
  const SIDEBAR_TRANSITION_MS = 340;

  const { handleItemClick, isItemActive } = useNavigationItems();

  const clearClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimerRef.current = setTimeout(() => {
      setSelectedItem(null);
      selectedItemRef.current = null;
      lastItemYRef.current = null;
      setDir(null);
    }, 150);
  }, [clearClose]);

  /**
   * setHoveredItem — llamado por cada SidebarItem al hacer hover.
   *
   * item=null  → programa cierre con delay (shared timer).
   * item!=null → cancela cierre y actualiza posición del panel y del Nub.
   *
   * El panel usa `animate={{ top }}` en framer-motion, por lo que siempre
   * se desliza suavemente hacia el trigger activo, igual que el Nub.
   * Esto evita que el Nub "vuele solo" cuando los ítems están lejos.
   */
  const setHoveredItem = useCallback((item: NavItem | null, triggerEl?: HTMLElement | null) => {
    clearClose();

    if (!item) {
      scheduleClose();
      return;
    }

    // Si el sidebar está en medio de su animación de ancho, guardar como pendiente.
    // Se abrirá automáticamente cuando la transición termine.
    if (isTransitioningRef.current) {
      pendingHoverRef.current = { item, triggerEl: triggerEl ?? null } as typeof pendingHoverRef.current;
      return;
    }

    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      // Dirección: comparar con el último ítem que abrió flyout
      if (lastItemYRef.current !== null && selectedItemRef.current !== null) {
        setDir(lastItemYRef.current < centerY ? 'down' : 'up');
      } else {
        setDir(null);
      }
      lastItemYRef.current = centerY;

      // 48px por ítem + 4px space-y-1 entre cada par + 16px padding (py-2)
      const estimatedHalfH = ((item.children?.length ?? 0) * 48 + Math.max(0, (item.children?.length ?? 1) - 1) * 4 + 16) / 2;
      const clampedTop = Math.min(Math.max(centerY, estimatedHalfH + 8), window.innerHeight - estimatedHalfH - 8);

      setPanelPos({ top: clampedTop, left: rect.right + 16 });
    }

    selectedItemRef.current = item;
    setSelectedItem(item);
  }, [clearClose, scheduleClose]);

  // Cuando isCollapsed cambia (colapsa o expande), cerrar el panel y marcar
  // isTransitioning=true durante el tiempo que dura la animación CSS del sidebar.
  const prevIsCollapsed = useRef(isCollapsed);
  useEffect(() => {
    // Cerrar siempre al cambiar estado
    setSelectedItem(null);
    selectedItemRef.current = null;
    lastItemYRef.current = null;
    setDir(null);

    // Solo bloquear apertura si el estado CAMBIA (no en el montaje inicial)
    if (prevIsCollapsed.current !== isCollapsed) {
      prevIsCollapsed.current = isCollapsed;
      isTransitioningRef.current = true;
      pendingHoverRef.current = null;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
        // Si el mouse sigue encima de un ítem, abrir su flyout ahora con
        // las coordenadas correctas (sidebar ya terminó de animar su ancho).
        const pending = pendingHoverRef.current;
        if (pending?.item && pending.triggerEl) {
          const rect = pending.triggerEl.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          lastItemYRef.current = centerY;
          const estimatedHalfH = ((pending.item.children?.length ?? 0) * 48 + Math.max(0, (pending.item.children?.length ?? 1) - 1) * 4 + 16) / 2;
          const clampedTop = Math.min(Math.max(centerY, estimatedHalfH + 8), window.innerHeight - estimatedHalfH - 8);
          setPanelPos({ top: clampedTop, left: rect.right + 16 });
          setDir(null);
          selectedItemRef.current = pending.item;
          setSelectedItem(pending.item);
        }
        pendingHoverRef.current = null;
      }, SIDEBAR_TRANSITION_MS);
    }
  }, [isCollapsed]);

  useEffect(() => () => {
    clearClose();
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
  }, [clearClose]);

  const contextValue = useMemo(() => ({
    selectedItemId: selectedItem?.id ?? null,
    setHoveredItem,
  }), [selectedItem, setHoveredItem]);

  return (
    <SidebarNavContext.Provider value={contextValue}>
      {children}

      {createPortal(
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ x: -8, y: '-50%', opacity: 0, top: panelPos.top }}
              animate={{ x: 0, y: '-50%', opacity: 1, top: panelPos.top }}
              exit={{ x: -8, y: '-50%', opacity: 0 }}
              transition={{
                x:       { duration: 0.15, ease: 'easeOut' },
                opacity: { duration: 0.15, ease: 'easeOut' },
                top:     { duration: 0.25, ease: 'easeInOut' },
              }}
              onMouseEnter={clearClose}
              onMouseLeave={scheduleClose}
              style={{ left: panelPos.left }}
              className="fixed z-50 min-w-[200px] max-w-[260px] rounded-lg bg-blanco-una-2 shadow-2xl overflow-visible"
            >
              {/* Bridge: área invisible que cubre el hueco entre trigger y panel */}
              <div className="absolute -left-[16px] top-0 h-full w-[16px]" />

              {/*
               * Nub — rombo que apunta al trigger activo.
               * initial={{ top: nubTop }}: arranca en la posición correcta (sin animación de entrada).
               * animate={{ top: nubTop }}: se desliza al nuevo trigger cuando se cambia de ítem.
               */}
              <span className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-blanco-una-2" />

              {/*
               * Contenido — "key" cambia al cambiar de ítem, lo que remonta el motion.div
               * y dispara el animation de entrada con la dirección correcta.
               * No hay animación de salida: el contenido anterior desaparece instantáneamente
               * (igual que en el ShiftingDropDown original).
               */}
              {/* relative z-10 pone el contenido por encima del Nub (z:auto) */}
              <div className="overflow-hidden rounded-lg relative z-10">
                {/* Encabezado de categoría */}
                <div className="px-3 pt-3 pb-1">
                  <p className={cn(TYPOGRAPHY.sidebarItem, 'text-negro-una font-semibold uppercase tracking-wider text-[11px]')}>
                    {selectedItem.label}
                  </p>
                </div>
                <motion.div
                  key={selectedItem.id}
                  initial={{
                    opacity: 0,
                    y: dir === 'down' ? 10 : dir === 'up' ? -10 : 0,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="py-2 px-2 space-y-1 relative"
                  onMouseLeave={() => setHoveredChildId(null)}
                >
                  {selectedItem.children?.map(child => {
                    const isActive = isItemActive(child.id);
                    const iconName = child.icon?.replace('system-icon:', '');
                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedItem(null);
                          selectedItemRef.current = null;
                          lastItemYRef.current = null;
                          handleItemClick(child.id, child.href, false);
                        }}
                        onMouseEnter={() => setHoveredChildId(child.id)}
                        className={cn(
                          'relative w-full flex items-center gap-3 px-sidebar-item h-sidebar-item text-left cursor-pointer z-10',
                          'transition-colors duration-150 rounded-corner focus:outline-none',
                          isActive
                            ? 'bg-rojo-una-2 text-blanco-una font-semibold'
                            : 'text-negro-una-2 hover:text-blanco-una-2',
                          TYPOGRAPHY.sidebarItem,
                        )}
                      >
                        {hoveredChildId === child.id && !isActive && (
                          <motion.div
                            layoutId="sidebar-child-hover-indicator"
                            className="absolute inset-0 bg-rojo-una-2 rounded-corner -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                          />
                        )}
                        {iconName && (
                          <span className={cn('flex-shrink-0 flex items-center justify-center', ICON_SIZES.sm)}>
                            {getIconByName(iconName, 'sm')}
                          </span>
                        )}
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </SidebarNavContext.Provider>
  );
};
