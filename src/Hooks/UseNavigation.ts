import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';

export const useNavigationItems = () => {
  const navigate = useNavigate();
  const { activeItemId, expandedItemId, setActiveItem, toggleExpanded, setExpandedItem } = useNavigation();

  const handleItemClick = (itemId: string, href?: string, isExpandable?: boolean) => {
    // Siempre marcar como activo
    setActiveItem(itemId);
    
    if (isExpandable) {
      // Para items expandibles: alternar expansión
      toggleExpanded(itemId);
      console.log(`Sección expandible: ${itemId}`);
    } else {
      // Para items NO expandibles: cerrar cualquier item expandido
      setExpandedItem(null);
      if (href) {
        console.log(`Navegando a: ${href} (${itemId})`);
        // Navegación con React Router
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