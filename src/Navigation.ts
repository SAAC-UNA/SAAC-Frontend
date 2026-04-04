import type { NavItem } from "./Types/CommonTypes";
import { evaluateAccess, type AccessRule } from "@/Utils/Authorization";

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
const reportsIcon = "system-icon:reports";
const lightIcon = "system-icon:lightbulb";

/**
 * Obtener items de navegacion filtrados por reglas de acceso.
 */
interface NavigationAccessInput {
  roles?: string[];
  permissions?: string[];
}

const normalizeAccessInput = (
  input?: string | string[] | NavigationAccessInput,
): NavigationAccessInput => {
  if (!input) {
    return { roles: [], permissions: [] };
  }

  if (typeof input === "string") {
    return { roles: [input], permissions: [] };
  }

  if (Array.isArray(input)) {
    return { roles: input, permissions: [] };
  }

  return {
    roles: input.roles ?? [],
    permissions: input.permissions ?? [],
  };
};

export const getNavigationItems = (
  accessInput?: string | string[] | NavigationAccessInput,
): NavItem[] => {
  const access = normalizeAccessInput(accessInput);
  const hasAccess = (rule?: AccessRule) => evaluateAccess(access, rule);

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

    if (
      hasAccess({
        requireAnyPermissions: ["roles.create", "roles.edit", "roles.delete"],
      })
    ) {
      adminChildren.push({
        id: "roles",
        label: "Roles",
        icon: rolesIcon,
        href: "/roles/listar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["usuarios.view"] })) {
      adminChildren.push({
        id: "usuarios",
        label: "Usuarios",
        icon: userIcon,
        href: "/usuarios/listar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["bitacora.view"] })) {
      adminChildren.push({
        id: "bitacora",
        label: "Bitácora del Sistema",
        icon: auditLogIcon,
        href: "/bitacora",
        isActive: false,
      });
    }

    if (adminChildren.length > 0) {
      items.push({
        id: "administracion",
        label: "Administración",
        icon: lightIcon,
        href: "#",
        isActive: false,
        isExpandable: true,
        children: adminChildren,
      });
    }
  }

  {
    const evidenciaChildren: NavItem[] = [];

    if (hasAccess({ requireAnyPermissions: ["evidencias.assign"] })) {
      evidenciaChildren.push({
        id: "evidenciasAsignar",
        label: "Asignar Entregables",
        icon: evidenceIcon,
        href: "/evidencias/asignar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["evidencias.view"] })) {
      evidenciaChildren.push(
        {
          id: "misEvidenciasAsignadas",
          label: "Mis Entregas",
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
    }

    if (evidenciaChildren.length > 0) {
      items.push({
        id: "evidencias",
        label: "Entregables",
        icon: evidenceIcon,
        href: "#",
        isActive: false,
        isExpandable: true,
        children: evidenciaChildren,
      });
    }
  }

  {
    const solicitudChildren: NavItem[] = [];

    if (
      hasAccess({
        requireAnyPermissions: [
          "solicitudes_ampliacion.approve",
          "solicitudes_ampliacion.reject",
        ],
      })
    ) {
      solicitudChildren.push({
        id: "gestionarSolicitudesAmpliacion",
        label: "Gestionar Solicitudes",
        icon: extensionRequestIcon,
        href: "/solicitudes-ampliacion/gestionar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["solicitudes_ampliacion.view"] })) {
      solicitudChildren.push({
        id: "misSolicitudesAmpliacion",
        label: "Mis Solicitudes",
        icon: extensionRequestIcon,
        href: "/solicitudes-ampliacion/mis-solicitudes",
        isActive: false,
      });
    }

    if (solicitudChildren.length > 0) {
      items.push({
        id: "solicitudesAmpliacion",
        label: "Ampliación",
        icon: calendarIcon,
        href: "#",
        isActive: false,
        isExpandable: true,
        children: solicitudChildren,
      });
    }
  }

  {
    const acreditacionChildren: NavItem[] = [];

    if (hasAccess({ requireAnyPermissions: ["procesos.view"] })) {
      acreditacionChildren.push({
        id: "procesos-acreditacion",
        label: "Procesos de Acreditación",
        icon: processIcon,
        href: "/procesos-acreditacion/listar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["elemento.view"] })) {
      acreditacionChildren.push({
        id: "estructura",
        label: "Gestión de Estructura",
        icon: nutIcon,
        href: "/estructura/listar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["modelos.view"] })) {
      acreditacionChildren.push({
        id: "modelos-acreditacion",
        label: "Modelos de Acreditación",
        icon: nutIcon,
        href: "/estructura/modelos",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["ciclos.view"] })) {
      acreditacionChildren.push({
        id: "ciclos-acreditacion",
        label: "Ciclos de Acreditación",
        icon: calendarIcon,
        href: "/ciclos-acreditacion",
        isActive: false,
      });
    }

    if (acreditacionChildren.length > 0) {
      items.push({
        id: "acreditacion",
        label: "Acreditación",
        icon: processIcon,
        href: "#",
        isActive: false,
        isExpandable: true,
        children: acreditacionChildren,
      });
    }
  }

  {
    const evaluacionChildren: NavItem[] = [];

    if (hasAccess({ requireAnyPermissions: ["compromisos_mejora.view"] })) {
      evaluacionChildren.push({
        id: "compromisos-mejora",
        label: "Compromisos de Mejora",
        icon: commitmentIcon,
        href: "/compromisos/listar",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["aprobaciones.view"] })) {
      evaluacionChildren.push({
        id: "aprobacion-bloques",
        label: "Aprobación de Bloques",
        icon: approvalIcon,
        href: "/aprobacion-bloques",
        isActive: false,
      });
    }

    if (hasAccess({ requireAnyPermissions: ["reportes.view"] })) {
      evaluacionChildren.push({
        id: "gestion-informes",
        label: "Gestión de Informes",
        icon: reportsIcon,
        href: "/gestion-informes",
        isActive: false,
      });
    }

    if (evaluacionChildren.length > 0) {
      items.push({
        id: "evaluacion",
        label: "Evaluación",
        icon: auditLogIcon,
        href: "#",
        isActive: false,
        isExpandable: true,
        children: evaluacionChildren,
      });
    }
  }

  return items;
};
