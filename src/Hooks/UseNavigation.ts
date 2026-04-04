import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/Context/NavigationContext';

/**
 * HOOK DE NAVEGACIÓN DEL SIDEBAR
 * 
 * Hook que facilita la interacción con elementos de navegación del sidebar.
 * Combina React Router con el contexto de navegación para manejar clicks,
 * estados activos y expansión de menús de forma centralizada.
 * 
 * FUNCIONALIDADES:
 * - Manejo unificado de clicks en elementos del menú
 * - Control de navegación y estado visual
 * - Gestión de elementos expandibles vs navegables
 * - Helpers para verificar estados (activo/expandido)
 */

export const useNavigationItems = () => {
  const navigate = useNavigate();
  const { activeItemId, expandedItemId, setActiveItem, toggleExpanded, setExpandedItem } = useNavigation();

  const handleItemClick = (itemId: string, href?: string, isExpandable?: boolean) => {
    // Siempre marcar como activo
    setActiveItem(itemId);
    
    if (isExpandable) {
      // Para items expandibles: alternar expansión
      toggleExpanded(itemId);
    } else {
      // Para items de hoja: navegar sin cerrar el grupo padre
      if (href && href !== '#') {
        navigate(href);
      }
    }
  };

  const isItemActive = (itemId: string) => {
    return activeItemId === itemId;
  };

  const isItemExpanded = (itemId: string) => {
    return expandedItemId === itemId;
  };

  return {
    activeItemId,
    expandedItemId,
    handleItemClick,
    isItemActive,
    isItemExpanded,
    setActiveItem,
    setExpandedItem,
    toggleExpanded
  };
};