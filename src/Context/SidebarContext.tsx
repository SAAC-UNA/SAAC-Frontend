import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useBreakpoint } from '@/Hooks/UseBreakpoint';
import type { ReactNode } from 'react';

/**
 * CONTEXTO DE GESTIÓN DEL SIDEBAR
 * 
 * Maneja todo el estado y comportamiento del sidebar de navegación,
 * incluyendo la detección automática de dispositivos móviles y
 * la adaptación del comportamiento según el tamaño de pantalla.
 * 
 * - Control de estado expandido/colapsado del sidebar
 * - Detección automática de dispositivos móviles
 * - Comportamiento diferenciado para móvil vs desktop
 * - API unificada para componentes hijos
 * 
 * - open: Estado general del sidebar
 * - openMobile: Estado específico para móviles
 * - isMobile: Detección de dispositivo móvil
 */

interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  // Mantener compatibilidad con la API anterior
  isCollapsed: boolean;
  collapseSidebar: () => void;
  expandSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ 
  children, 
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp 
}) => {
  const { isMobile } = useBreakpoint();
  const [openMobile, setOpenMobile] = useState(false);

  // Estado interno del sidebar
  const [_open, _setOpen] = useState(() => defaultOpen);
  const open = openProp ?? _open;
  
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // Guardar estado en localStorage
      try {
        localStorage.setItem('sidebar_state', openState ? 'expanded' : 'collapsed');
      } catch (error) {
        console.warn('No se pudo guardar el estado del sidebar en localStorage');
      }
    },
    [setOpenProp, open]
  );

  // Función para alternar el sidebar
  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_state');
      if (saved && !openProp) {
        _setOpen(saved === 'expanded');
      }
    } catch (error) {
      console.warn('No se pudo cargar el estado del sidebar desde localStorage');
    }
  }, [openProp]);

  // Atajo de teclado para alternar sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed';

  // Funciones de compatibilidad con la API anterior
  const isCollapsed = !open;
  const collapseSidebar = () => setOpen(false);
  const expandSidebar = () => setOpen(true);

  const contextValue = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    // Compatibilidad con API anterior
    isCollapsed,
    collapseSidebar,
    expandSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};