import type { NavItem } from './Types/CommonTypes';

const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
const nutIcon = 'system-icon:nut';
const userIcon = 'system-icon:user';
const processIcon = 'system-icon:box-archive';
const evidenceIcon = 'system-icon:assignEvidence';
const myEvidencesIcon = 'system-icon:myEvidences';
const auditLogIcon = 'system-icon:auditLog';
const extensionRequestIcon = 'system-icon:clock';

/**
 * Obtener items de navegación filtrados por rol
 * @param userRole - Rol del usuario autenticado ('SuperUsuario' o 'Administrador')
 */
export const getNavigationItems = (userRole?: string): NavItem[] => {
  const isSuperUser = userRole === 'SuperUsuario';
  const isEncargado = userRole === 'Encargado de Acreditación';
  
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

  // Bitácora del Sistema - Solo SuperUsuario
  if (isSuperUser) {
    items.push({
      id: 'bitacora',
      label: 'Bitácora del Sistema',
      icon: auditLogIcon,
      href: '/bitacora',
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
  items.push(
  {
    id: 'evidenciasAsignar',
    label: 'Asignar Evidencias',
    icon: evidenceIcon,
    href: '/evidencias/asignar',
    isActive: false,
  },
  {
    id: 'misEvidenciasAsignadas',
    label: 'Mis Evidencias Asignadas',
    icon: myEvidencesIcon,
    href: '/mis-evidencias-asignadas',
    isActive: false,
  },
  {
    id: 'estructura',
    label: 'Gestión de Estructura',
    icon: nutIcon,
    href: '/estructura/listar',
    isActive: false
  });

  // HU-016: Solicitudes de Ampliación
  // Gestionar solicitudes - Solo Encargados
  if (isEncargado || isSuperUser) {
    items.push({
      id: 'gestionarSolicitudesAmpliacion',
      label: 'Gestionar Solicitudes',
      icon: extensionRequestIcon,
      href: '/solicitudes-ampliacion/gestionar',
      isActive: false,
    });
  }

  // Mis solicitudes - Todos los autenticados
  items.push({
    id: 'misSolicitudesAmpliacion',
    label: 'Mis Solicitudes de Ampliación',
    icon: extensionRequestIcon,
    href: '/solicitudes-ampliacion/mis-solicitudes',
    isActive: false,
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