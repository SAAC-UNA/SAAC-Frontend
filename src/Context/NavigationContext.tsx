import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getNavigationItems } from "@/Navigation";
import { useAuth } from "@/Context/AuthContext";
import { useOperationalContextStatus } from "@/Hooks/useOperationalContextStatus";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import { ROUTES } from "@/Constants/ROUTES";

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

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasOperationalContext } = useOperationalContextStatus();
  const operationalContext = useOperationalContextSnapshot();

  // Obtener items filtrados por reglas de acceso (roles + permisos)
  const navigationItems = getNavigationItems({
    roles: user?.roles?.map((r) => r.name),
    permissions: user?.all_permissions?.map((p) => p.name),
    context: {
      hasOperationalContext,
      cycleId: operationalContext.cycleId,
      processId: operationalContext.processId,
    },
  });

  // Función para encontrar el item activo y su grupo padre basado en la ruta actual
  const findActiveItemByPath = (
    path: string,
  ): { activeId: string; parentId: string | null } => {
    // Primero buscar coincidencias exactas
    for (const item of navigationItems) {
      if (item.href === path) {
        return { activeId: item.id, parentId: null };
      }
      // Buscar en children si existen
      if (item.children) {
        for (const child of item.children) {
          if (child.href === path) {
            return { activeId: child.id, parentId: item.id };
          }
        }
      }
    }

    // Si no hay coincidencia exacta, buscar por prefijo de módulo
    if (path.startsWith(ROUTES.ROLES)) {
      return { activeId: "roles", parentId: "administracion" };
    }
    if (path.startsWith(ROUTES.STRUCTURE)) {
      return { activeId: "estructura", parentId: "acreditacion" };
    }
    if (path.startsWith(ROUTES.ACCREDITATION)) {
      return { activeId: "gestion-acreditacion", parentId: "acreditacion" };
    }
    if (path.startsWith(ROUTES.USERS)) {
      return { activeId: "usuarios", parentId: "administracion" };
    }
    if (path.startsWith(ROUTES.COMMITMENTS)) {
      return { activeId: "compromisos-mejora", parentId: "acreditacion" };
    }
    if (path.startsWith(ROUTES.EVIDENCE_MY)) {
      return { activeId: "misEvidenciasAsignadas", parentId: "evidencias" };
    }
    if (path.startsWith("/entregables")) {
      return { activeId: "evidenciasAsignar", parentId: "evidencias" };
    }
    if (path.startsWith(ROUTES.AUDIT_LOG)) {
      return { activeId: "bitacora", parentId: "administracion" };
    }
    if (path.startsWith("/solicitudes-ampliacion")) {
      return {
        activeId: "misSolicitudesAmpliacion",
        parentId: "solicitudesAmpliacion",
      };
    }
    if (path.startsWith(ROUTES.BLOCK_APPROVAL)) {
      return { activeId: "aprobacion-bloques", parentId: "acreditacion" };
    }

    return { activeId: "inicio", parentId: null }; // Default
  };

  // Inicializar con el estado correcto desde el principio
  const [activeItemId, setActiveItemId] = useState<string | null>(() => {
    return findActiveItemByPath(location.pathname).activeId;
  });
  const [expandedItemId, setExpandedItemId] = useState<string | null>(() => {
    return findActiveItemByPath(location.pathname).parentId;
  });

  // Actualizar el item activo y el grupo expandido cuando cambie la ruta
  useEffect(() => {
    const { activeId, parentId } = findActiveItemByPath(location.pathname);
    setActiveItemId(activeId);
    if (parentId) {
      setExpandedItemId(parentId);
    }
  }, [
    location.pathname,
    hasOperationalContext,
    operationalContext.cycleId,
    operationalContext.processId,
  ]);

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
    <NavigationContext.Provider
      value={{
        activeItemId,
        expandedItemId,
        setActiveItem,
        setExpandedItem,
        toggleExpanded,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
