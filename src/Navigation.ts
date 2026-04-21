import type { NavItem } from "./Types/CommonTypes";
import { evaluateAccess, type AccessRule } from "@/Utils/Authorization";
import { ROUTES } from "@/Constants/ROUTES";
import {
  CAPABILITIES,
  EVIDENCE_ASSIGNMENT_PERMISSIONS,
  EVIDENCE_VIEW_PERMISSIONS,
  REPORTS_ACCESS_PERMISSIONS,
  ROLE_MANAGEMENT_PERMISSIONS,
  USER_MANAGEMENT_PERMISSIONS,
} from "@/Constants/PermissionCapabilities";

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
const approvalIcon = "system-icon:check-circle";
const extensionRequestIcon = "system-icon:clock";
const calendarIcon = "system-icon:calendar";
const reportsIcon = "system-icon:reports";
const lightIcon = "system-icon:lightbulb";
const informeIcon = "system-icon:informe";
const medalIcon = "system-icon:medal";

/**
 * Obtener items de navegacion filtrados por reglas de acceso.
 */
interface NavigationAccessInput {
  roles?: string[];
  permissions?: string[];
  context?: {
    hasOperationalContext?: boolean;
    cycleId?: number | null;
    processId?: number | null;
  };
}

const normalizeAccessInput = (
  input?: string | string[] | NavigationAccessInput,
): NavigationAccessInput => {
  if (!input) {
    return {
      roles: [],
      permissions: [],
      context: { hasOperationalContext: true },
    };
  }

  if (typeof input === "string") {
    return {
      roles: [input],
      permissions: [],
      context: { hasOperationalContext: true, cycleId: null, processId: null },
    };
  }

  if (Array.isArray(input)) {
    return {
      roles: input,
      permissions: [],
      context: { hasOperationalContext: true, cycleId: null, processId: null },
    };
  }

  return {
    roles: input.roles ?? [],
    permissions: input.permissions ?? [],
    context: {
      hasOperationalContext: input.context?.hasOperationalContext ?? true,
      cycleId: input.context?.cycleId ?? null,
      processId: input.context?.processId ?? null,
    },
  };
};

export const getNavigationItems = (
  accessInput?: string | string[] | NavigationAccessInput,
): NavItem[] => {
  const access = normalizeAccessInput(accessInput);
  const hasAccess = (rule?: AccessRule) => evaluateAccess(access, rule);
  const isSuperUser = (access.roles ?? []).some((role) => {
    const normalizedRole = role.toLowerCase();
    return (
      normalizedRole === "superusuario" || normalizedRole === "super usuario"
    );
  });
  const hasCycleSelection = access.context?.cycleId !== null;
  const hasProcessSelection = access.context?.processId !== null;
  const hasContextualSelection =
    isSuperUser || (hasCycleSelection && hasProcessSelection);

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
        requireAnyCapabilities: [CAPABILITIES.ADMIN_ROLES_MANAGE],
        requireAnyPermissions: ROLE_MANAGEMENT_PERMISSIONS,
      })
    ) {
      adminChildren.push({
        id: "roles",
        label: "Roles",
        icon: rolesIcon,
        href: ROUTES.ROLES,
        isActive: false,
      });
    }

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.ADMIN_USERS_MANAGE],
        requireAnyPermissions: USER_MANAGEMENT_PERMISSIONS,
      })
    ) {
      adminChildren.push({
        id: "usuarios",
        label: "Usuarios",
        icon: userIcon,
        href: ROUTES.USERS,
        isActive: false,
      });
    }

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.AUDIT_VIEW],
        requireAnyPermissions: ["bitacora.view"],
      })
    ) {
      adminChildren.push({
        id: "bitacora",
        label: "Bitácora del Sistema",
        icon: auditLogIcon,
        href: ROUTES.AUDIT_LOG,
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
    const acreditacionChildren: NavItem[] = [];

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.ACCREDITATION_MODEL_VIEW],
        requireAnyPermissions: ["modelos.view"],
      })
    ) {
      acreditacionChildren.push({
        id: "modelos-acreditacion",
        label: "Modelos de Acreditación",
        icon: nutIcon,
        href: ROUTES.STRUCTURE_MODELS,
        isActive: false,
      });
    }

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.ACCREDITATION_CYCLE_VIEW],
        requireAnyPermissions: ["ciclos.view"],
      })
    ) {
      acreditacionChildren.push({
        id: "ciclos-acreditacion",
        label: "Ciclos de Acreditación",
        icon: calendarIcon,
        href: ROUTES.ACCREDITATION_CYCLES,
        isActive: false,
      });
    }

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.ACCREDITATION_PROCESS_VIEW],
        requireAnyPermissions: ["procesos.view"],
      })
    ) {
      acreditacionChildren.push({
        id: "procesos-acreditacion",
        label: "Procesos de Acreditación",
        icon: processIcon,
        href: ROUTES.ACCREDITATION_PROCESSES,
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
    const evidenciaChildren: NavItem[] = [];

    if (
      hasContextualSelection &&
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.EVIDENCE_ASSIGN],
        requireAnyPermissions: EVIDENCE_ASSIGNMENT_PERMISSIONS,
      })
    ) {
      evidenciaChildren.push({
        id: "evidenciasAsignar",
        label: "Asignar Entregables",
        icon: evidenceIcon,
        href: ROUTES.EVIDENCE_ASSIGN,
        isActive: false,
      });
    }

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.EVIDENCE_VIEW],
        requireAnyPermissions: EVIDENCE_VIEW_PERMISSIONS,
      })
    ) {
      evidenciaChildren.push({
        id: "misEvidenciasAsignadas",
        label: "Mis Entregas",
        icon: myEvidencesIcon,
        href: ROUTES.EVIDENCE_MY,
        isActive: false,
      });
    }

    if (
      hasContextualSelection &&
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.EVIDENCE_ASSIGN],
        requireAnyPermissions: EVIDENCE_ASSIGNMENT_PERMISSIONS,
      })
    ) {
      evidenciaChildren.push({
        id: "busquedaEvidencias",
        label: "Buscar Entregables",
        icon: searchEvidenceIcon,
        href: ROUTES.EVIDENCE_SEARCH,
        isActive: false,
      });
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
        requireAnyCapabilities: [CAPABILITIES.EXTENSION_VIEW],
        requireAnyPermissions: ["solicitudes_ampliacion.view"],
      })
    ) {
      solicitudChildren.push({
        id: "misSolicitudesAmpliacion",
        label: "Mis Solicitudes",
        icon: extensionRequestIcon,
        href: ROUTES.EXTENSION_REQUESTS_MY,
        isActive: false,
      });
    }

    if (
      hasContextualSelection &&
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.EXTENSION_MANAGE],
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
        href: ROUTES.EXTENSION_REQUESTS_MANAGE,
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

  if (hasContextualSelection) {
    const evaluacionChildren: NavItem[] = [];

    if (
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.APPROVALS_VIEW],
        requireAnyPermissions: ["aprobaciones.view"],
      })
    ) {
      evaluacionChildren.push({
        id: "aprobacion-bloques",
        label: "Aprobación de Bloques",
        icon: approvalIcon,
        href: ROUTES.BLOCK_APPROVAL,
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

  {
    const informeChildren: NavItem[] = [];

    if (
      hasContextualSelection &&
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.REPORTS_ACCESS],
        requireAnyPermissions: REPORTS_ACCESS_PERMISSIONS,
      })
    ) {
      informeChildren.push({
        id: "gestion-informes",
        label: "Gestión de Informes",
        icon: reportsIcon,
        href: ROUTES.REPORTS,
        isActive: false,
      });
    }

    if (
      hasContextualSelection &&
      hasAccess({
        requireAnyCapabilities: [CAPABILITIES.REPORTS_ACCESS],
        requireAnyPermissions: REPORTS_ACCESS_PERMISSIONS,
      })
    ) {
      informeChildren.push({
        id: "informe-gestion",
        label: "Informe de Acreditación",
        icon: medalIcon,
        href: ROUTES.SINAES_ADMIN,
        isActive: false,
      });
    }

    items.push({
      id: "informe",
      label: "Informes",
      icon: informeIcon,
      href: "#",
      isActive: false,
      isExpandable: true,
      children: informeChildren,
    });
  }

  return items;
};
