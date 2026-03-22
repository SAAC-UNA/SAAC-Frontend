import { createContext } from 'react';
import type { NavItem } from '@/Types/CommonTypes';

export interface SidebarNavContextType {
  /** ID del ítem cuyo panel está actualmente abierto (null = ninguno) */
  selectedItemId: string | null;
  /** Llamar al hacer hover sobre un ítem expandible; null para solicitar cierre */
  setHoveredItem: (item: NavItem | null, triggerEl?: HTMLElement | null) => void;
}

export const SidebarNavContext = createContext<SidebarNavContextType>({
  selectedItemId: null,
  setHoveredItem: () => {},
});
