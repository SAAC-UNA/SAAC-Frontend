import type { NavItem } from './Types/CommonTypes';

const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
const nutIcon = 'system-icon:nut';
const userIcon = 'system-icon:user';
const processIcon = 'system-icon:box-archive';
const cycleIcon = 'system-icon:calendar';

/**
 * Obtener items de navegación filtrados por rol
 * @param userRole - Rol del usuario autenticado ('SuperUsuario' o 'Administrador')
 */
export const getNavigationItems = (userRole?: string): NavItem[] => {
  const isSuperUser = userRole === 'SuperUsuario';
  
  const items: NavItem[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: homeIcon,
      href: '/',
      isActive: false
    }
  ];

  // Roles - Solo SuperUsuario
  if (isSuperUser) {
    items.push({
      id: 'roles',
      label: 'Roles',
      icon: rolesIcon,
      href: '/roles/listar',
      isActive: false
    });
  }

  // Usuarios - Todos los autenticados
  items.push({
    id: 'usuarios',
    label: 'Usuarios',
    icon: userIcon,
    href: '/usuarios/listar',
    isActive: false
  });

  // Gestión de Estructura - Todos los autenticados
  items.push({
    id: 'estructura',
    label: 'Gestión de Estructura',
    icon: nutIcon,
    href: '/estructura/listar',
    isActive: false
  });

  // Avance de Acreditación - Todos los autenticados (filtrado por carrera en el backend)
  items.push({
    id: 'avance-acreditacion',
    label: 'Avance de Acreditación',
    icon: processIcon,
    href: '/acreditacion/avance',
    isActive: false
  });

  return items;
};

/**
 * Items de navegación por defecto (sin filtrar por rol)
 * Usar getNavigationItems() para obtener los items filtrados
 */
export const navigationItems: NavItem[] = getNavigationItems();