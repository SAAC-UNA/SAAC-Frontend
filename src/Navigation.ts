import type { NavItem } from "./Types/CommonTypes";

// ===== ICONOS =====
const homeIcon = "system-icon:home";
const rolesIcon = "system-icon:shield";
const nutIcon = "system-icon:nut";
const userIcon = "system-icon:user";
const processIcon = "system-icon:box-archive";
const evidenceIcon = "system-icon:assignEvidence";
const myEvidencesIcon = "system-icon:myEvidences";
const searchEvidenceIcon = "system-icon:search";
const auditLogIcon = "system-icon:edit-element";
const commitmentIcon = "system-icon:box-archive";
const approvalIcon = "system-icon:check-circle";
const extensionRequestIcon = "system-icon:clock";
const calendarIcon = "system-icon:calendar";
const reportsIcon = "system-icon:document-text";
const lightIcon = "system-icon:lightbulb";

/**
 * Obtener items de navegacion filtrados por rol
 * @param userRoles - Array de roles del usuario autenticado o un solo rol como string
 */
export const getNavigationItems = (
  userRoles?: string | string[],
): NavItem[] => {
  // Normalizar a array
  const roles = Array.isArray(userRoles)
    ? userRoles
    : userRoles
      ? [userRoles]
      : [];

  const isSuperUser = roles.includes("Superusuario");
  const isAdmin = roles.includes("Administrador");
  const isEncargado = roles.includes("Encargado de Acreditaci\u00f3n");

  const items: NavItem[] = [
    {
      id: "inicio",
      label: "Inicio",
      icon: homeIcon,
      href: "/",
      isActive: false,
    },
  ];

  {
    const adminChildren: NavItem[] = [];

    if (isSuperUser) {
      adminChildren.push({
        id: "roles",
        label: "Roles",
        icon: rolesIcon,
        href: "/roles/listar",
        isActive: false,
      });
    }

    adminChildren.push({
      id: "usuarios",
      label: "Usuarios",
      icon: userIcon,
      href: "/usuarios/listar",
      isActive: false,
    });

    if (isSuperUser) {
      adminChildren.push({
        id: "bitacora",
        label: "Bitacora del Sistema",
        icon: auditLogIcon,
        href: "/bitacora",
        isActive: false,
      });
    }

    items.push({
      id: "administracion",
      label: "Administracion",
      icon: lightIcon,
      href: "#",
      isActive: false,
      isExpandable: true,
      children: adminChildren,
    });
  }

  {
    const evidenciaChildren: NavItem[] = [];

    if (isAdmin || isEncargado || isSuperUser) {
      evidenciaChildren.push({
        id: "evidenciasAsignar",
        label: "Asignar Evidencias",
        icon: evidenceIcon,
        href: "/evidencias/asignar",
        isActive: false,
      });
    }

    evidenciaChildren.push(
      {
        id: "misEvidenciasAsignadas",
        label: "Mis Evidencias",
        icon: myEvidencesIcon,
        href: "/mis-evidencias-asignadas",
        isActive: false,
      },
      {
        id: "busquedaEvidencias",
        label: "Busqueda de Criterios",
        icon: searchEvidenceIcon,
        href: "/evidencias/busqueda-avanzada",
        isActive: false,
      },
    );

    items.push({
      id: "evidencias",
      label: "Evidencias",
      icon: evidenceIcon,
      href: "#",
      isActive: false,
      isExpandable: true,
      children: evidenciaChildren,
    });
  }

  {
    const solicitudChildren: NavItem[] = [];

    if (isEncargado || isSuperUser) {
      solicitudChildren.push({
        id: "gestionarSolicitudesAmpliacion",
        label: "Gestionar Solicitudes",
        icon: extensionRequestIcon,
        href: "/solicitudes-ampliacion/gestionar",
        isActive: false,
      });
    }

    solicitudChildren.push({
      id: "misSolicitudesAmpliacion",
      label: "Mis Solicitudes",
      icon: extensionRequestIcon,
      href: "/solicitudes-ampliacion/mis-solicitudes",
      isActive: false,
    });

    items.push({
      id: "solicitudesAmpliacion",
      label: "Ampliacion",
      icon: calendarIcon,
      href: "#",
      isActive: false,
      isExpandable: true,
      children: solicitudChildren,
    });
  }

  items.push({
    id: "acreditacion",
    label: "Acreditacion",
    icon: processIcon,
    href: "#",
    isActive: false,
    isExpandable: true,
    children: [
      {
        id: "procesos-acreditacion",
        label: "Procesos de Acreditacion",
        icon: processIcon,
        href: "/procesos-acreditacion/listar",
        isActive: false,
      },
      {
        id: "estructura",
        label: "Gestion de Estructura",
        icon: nutIcon,
        href: "/estructura/listar",
        isActive: false,
      },
      ...(isAdmin || isSuperUser
        ? [
            {
              id: 'modelos-acreditacion',
              label: 'Modelos de Acreditación',
              icon: nutIcon,
              href: '/estructura/modelos',
              isActive: false,
            },
            {
              id: 'ciclos-acreditacion',
              label: 'Ciclos de Acreditación',
              icon: calendarIcon,
              href: '/ciclos-acreditacion',
              isActive: false,
            },
          ]
        : []),
      {
        id: "compromisos-mejora",
        label: "Compromisos de Mejora",
        icon: commitmentIcon,
        href: "/compromisos/listar",
        isActive: false,
      },
      {
        id: "aprobacion-bloques",
        label: "Aprobacion de Bloques",
        icon: approvalIcon,
        href: "/aprobacion-bloques",
        isActive: false,
      },
      {
        id: "gestion-informes",
        label: "Gestion de Informes",
        icon: reportsIcon,
        href: "/gestion-informes",
        isActive: false,
      },
    ],
  });

  return items;
};
