import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { navigationItems } from '@/Navigation';

/**
 * CONTEXTO DE NAVEGACIÓN DEL SIDEBAR
 * 
 * Contexto global que maneja todo el estado y comportamiento de la navegación
 * en el sidebar de la aplicación. Controla qué elementos están activos,
 * expandidos y sincroniza la navegación con las rutas de React Router.
 */

interface NavigationContextType {
  activeItemId: string | null;
  expandedItemId: string | null;
  setActiveItem: (itemId: string) => void;
  setExpandedItem: (itemId: string | null) => void;
  toggleExpanded: (itemId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  
  // Función para encontrar el item activo basado en la ruta actual
  const findActiveItemByPath = (path: string) => {
    // Primero buscar coincidencias exactas
    for (const item of navigationItems) {
      if (item.href === path) {
        return item.id;
      }
      // Buscar en children si existen
      if (item.children) {
        for (const child of item.children) {
          if (child.href === path) {
            return child.id;
          }
        }
      }
    }

    // Si no hay coincidencia exacta, buscar por prefijo de módulo
    // Esto maneja rutas como /roles/crear, /roles/editar/123, etc.
    if (path.startsWith('/roles')) {
      return 'roles';
    }
    if (path.startsWith('/estructura')) {
      return 'estructura';
    }
    if (path.startsWith('/usuarios')) {
      return 'usuarios';
    }

    return 'inicio'; // Default
  };

  // Inicializar con el estado correcto desde el principio
  const [activeItemId, setActiveItemId] = useState<string | null>(() => {
    return findActiveItemByPath(location.pathname);
  });
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Actualizar el item activo cuando cambie la ruta
  useEffect(() => {
    const activeId = findActiveItemByPath(location.pathname);
    setActiveItemId(activeId);
  }, [location.pathname]);

  const setActiveItem = (itemId: string) => {
    setActiveItemId(itemId);
  };

  const setExpandedItem = (itemId: string | null) => {
    setExpandedItemId(itemId);
  };

  /* Función para alternar el estado expandido de un item del sidebar (para los que tienen hijos) */
  const toggleExpanded = (itemId: string) => {
    // Si el item ya está expandido, se cierra. Si no, se expande y se cierra cualquier otro
    if (expandedItemId === itemId) {
      setExpandedItemId(null); // Cerrar el item actual
    } else {
      setExpandedItemId(itemId); // Expandir el nuevo item y cerrar cualquier otro
    }
  };

  return (
    <NavigationContext.Provider value={{ 
      activeItemId, 
      expandedItemId,
      setActiveItem, 
      setExpandedItem,
      toggleExpanded 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};