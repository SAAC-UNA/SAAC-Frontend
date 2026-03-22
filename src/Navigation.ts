import type { NavItem } from './Types/CommonTypes';

// ===== ICONOS =====
const homeIcon = 'system-icon:home';
const rolesIcon = 'system-icon:shield';
const nutIcon = 'system-icon:nut';
const userIcon = 'system-icon:user';
const processIcon = 'system-icon:box-archive';
const evidenceIcon = 'system-icon:assignEvidence';
const myEvidencesIcon = 'system-icon:myEvidences';
const searchEvidenceIcon = 'system-icon:search';
const auditLogIcon = 'system-icon:edit-element';
const commitmentIcon = 'system-icon:box-archive';
const approvalIcon = 'system-icon:check-circle';
const extensionRequestIcon = 'system-icon:clock';
const calendarIcon = 'system-icon:calendar';
const reportsIcon = 'system-icon:document-text';
const lightIcon = 'system-icon:lightbulb';

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
    // ── 1. Inicio ──────────────────────────────────────────────────────────
    {
      id: 'inicio',
      label: 'Inicio',
      icon: homeIcon,
      href: '/',
      isActive: false,
    },
  ];

  // ── 2. Administración (SuperUsuario ve Roles + Bitácora; todos ven Usuarios) ──
  {
    const adminChildren: NavItem[] = [];

    if (isSuperUser) {
      adminChildren.push({
        id: 'roles',
        label: 'Roles',
        icon: rolesIcon,
        href: '/roles/listar',
        isActive: false,
      });
    }

    adminChildren.push({
      id: 'usuarios',
      label: 'Usuarios',
      icon: userIcon,
      href: '/usuarios/listar',
      isActive: false,
    });

    if (isSuperUser) {
      adminChildren.push({
        id: 'bitacora',
        label: 'Bitácora del Sistema',
        icon: auditLogIcon,
        href: '/bitacora',
        isActive: false,
      });
    }

    items.push({
      id: 'administracion',
      label: 'Administración',
      icon: lightIcon,
      href: '#',
      isActive: false,
      isExpandable: true,
      children: adminChildren,
    });
  }

  // ── 3. Evidencias ──────────────────────────────────────────────────────
  items.push({
    id: 'evidencias',
    label: 'Evidencias',
    icon: evidenceIcon,
    href: '#',
    isActive: false,
    isExpandable: true,
    children: [
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
        label: 'Búsqueda de Criterios',
        icon: searchEvidenceIcon,
        href: '/evidencias/busqueda-avanzada',
        isActive: false,
      },
    ],
  });

  // ── 4. Solicitudes de Ampliación ───────────────────────────────────────
  {
    const solicitudChildren: NavItem[] = [];

    if (isEncargado || isSuperUser) {
      solicitudChildren.push({
        id: 'gestionarSolicitudesAmpliacion',
        label: 'Gestionar Solicitudes',
        icon: extensionRequestIcon,
        href: '/solicitudes-ampliacion/gestionar',
        isActive: false,
      });
    }

    solicitudChildren.push({
      id: 'misSolicitudesAmpliacion',
      label: 'Mis Solicitudes',
      icon: extensionRequestIcon,
      href: '/solicitudes-ampliacion/mis-solicitudes',
      isActive: false,
    });

    items.push({
      id: 'solicitudesAmpliacion',
      label: 'Ampliación',
      icon: calendarIcon,
      href: '#',
      isActive: false,
      isExpandable: true,
      children: solicitudChildren,
    });
  }

  // ── 5. Acreditación ────────────────────────────────────────────────────
  items.push({
    id: 'acreditacion',
    label: 'Acreditación',
    icon: processIcon,
    href: '#',
    isActive: false,
    isExpandable: true,
    children: [
      {
        id: 'estructura',
        label: 'Gestión de Estructura',
        icon: nutIcon,
        href: '/estructura/listar',
        isActive: false,
      },
      {
        id: 'compromisos-mejora',
        label: 'Compromisos de Mejora',
        icon: commitmentIcon,
        href: '/compromisos/listar',
        isActive: false,
      },
      {
        id: 'aprobacion-bloques',
        label: 'Aprobación de Bloques',
        icon: approvalIcon,
        href: '/aprobacion-bloques',
        isActive: false,
      },
      {
        id: 'gestion-informes',
        label: 'Gestión de Informes',
        icon: reportsIcon,
        href: '/gestion-informes',
        isActive: false,
      },
    ],
  });

  return items;
};