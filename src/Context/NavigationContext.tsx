import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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
  const [activeItemId, setActiveItemId] = useState<string | null>('inicio'); // Inicio por defecto
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null); // Ninguno expandido por defecto

  const setActiveItem = (itemId: string) => {
    setActiveItemId(itemId);
  };

  const setExpandedItem = (itemId: string | null) => {
    setExpandedItemId(itemId);
  };

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