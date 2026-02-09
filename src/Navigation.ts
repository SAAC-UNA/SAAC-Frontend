import type { NavItem } from './Types/CommonTypes';

const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
const nutIcon = 'system-icon:nut';
const userIcon = 'system-icon:user';
const processIcon = 'system-icon:box-archive';
const evidenceIcon = 'system-icon:shield';
const myEvidencesIcon = 'system-icon:clipboard-list';
const searchEvidenceIcon = 'system-icon:magnifying-glass';
const auditLogIcon = 'system-icon:clipboard-list';
const commitmentIcon = 'system-icon:clipboard-check';
const approvalIcon = 'system-icon:check-circle';
const extensionRequestIcon = 'system-icon:clock';
const reportsIcon = 'system-icon:document-text';

/**
 * Obtener items de navegación filtrados por rol
 * @param userRoles - Array de roles del usuario autenticado o un solo rol como string
 */
export const getNavigationItems = (userRoles?: string | string[]): NavItem[] => {
  // Normalizar a array
  const roles = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];
  
  const isSuperUser = roles.includes('Superusuario');
  const isEncargado = roles.includes('Encargado de Acreditación');
  
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
    label: 'Mis Evidencias',
    icon: myEvidencesIcon,
    href: '/mis-evidencias-asignadas',
    isActive: false,
  },
  {
    id: 'busquedaEvidencias',
    label: 'Búsqueda de Evidencias',
    icon: searchEvidenceIcon,
    href: '/evidencias/busqueda-avanzada',
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

  // Compromisos de Mejora - Todos los autenticados
  items.push({
    id: 'compromisos-mejora',
    label: 'Compromisos de Mejora',
    icon: commitmentIcon,
    href: '/compromisos/listar',
    isActive: false
  });

  // Aprobación de Bloques - Todos los autenticados
  items.push({
    id: 'aprobacion-bloques',
    label: 'Aprobación de Bloques',
    icon: approvalIcon,
    href: '/aprobacion-bloques',
    isActive: false
  });

  // Gestión de Informes - Todos los autenticados
  items.push({
    id: 'gestion-informes',
    label: 'Gestión de Informes',
    icon: reportsIcon,
    href: '/gestion-informes',
    isActive: false
  });

  return items;
};

/**
 * Items de navegación por defecto (sin filtrar por rol)
 * Usar getNavigationItems() para obtener los items filtrados
 */
export const navigationItems: NavItem[] = getNavigationItems();