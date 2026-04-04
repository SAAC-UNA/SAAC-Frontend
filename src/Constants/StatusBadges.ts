/**
 * StatusBadges - Configuración centralizada de badges de estado
 * Fuente única de verdad para labels y colores de todos los estados del sistema.
 */

import type { EvidencePublicationStatus } from "@/Types/EvidenceSearchTypes";
import type { AssignmentStatus } from "@/Types/EvidenceAssignmentTypes";
import type { ExtensionRequestStatus } from "@/Types/ExtensionRequestTypes";

export interface StatusBadgeConfig {
  label: string;
  colorClasses: string;
}

/** Config de solo color — para badges sin label fijo (recursos, roles, tipos, etc.) */
export interface BadgeColorConfig {
  colorClasses: string;
}

/** Estados de publicación de evidencia — enum PascalCase (EVIDENCIA.estado) */
export const EVIDENCE_STATUS_BADGE: Record<
  EvidencePublicationStatus,
  StatusBadgeConfig
> = {
  Pendiente: {
    label: "Pendiente",
    colorClasses:
      "bg-neutral-secondary-medium border-default-medium text-heading",
  },
  "En Proceso": {
    label: "En proceso",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  Aprobado: {
    label: "Aprobado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  Rechazado: {
    label: "Rechazado",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  Completado: {
    label: "Completado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  Vencido: {
    label: "Vencido",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  Observada: {
    label: "Observada",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  Validada: {
    label: "Validada",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
};

/** Estados de asignación de evidencia a responsable */
export const ASSIGNMENT_STATUS_BADGE: Record<
  AssignmentStatus,
  StatusBadgeConfig
> = {
  pendiente: {
    label: "Pendiente",
    colorClasses:
      "bg-neutral-secondary-medium border-default-medium text-heading",
  },
  en_progreso: {
    label: "En progreso",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  completado: {
    label: "Completado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  vencido: {
    label: "Vencido",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
};

/** Estados de solicitud de ampliación de plazo */
export const EXTENSION_REQUEST_STATUS_BADGE: Record<
  ExtensionRequestStatus,
  StatusBadgeConfig
> = {
  pendiente: {
    label: "Pendiente",
    colorClasses:
      "bg-neutral-secondary-medium border-default-medium text-heading",
  },
  aprobada: {
    label: "Aprobado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  rechazada: {
    label: "Rechazado",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
};

/** Estado activo/inactivo de un usuario */
export const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  active: {
    label: "Activo",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  inactive: {
    label: "Inactivo",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
};

/** Paleta de colores del sistema — bg light + texto tono 400
 * Úsala para asignar colores a cualquier badge dinámicamente. */
export const BADGE_COLORS: Record<string, BadgeColorConfig> = {
  verde: {
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  teal: {
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  warning: {
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  naranja: {
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  error: {
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  rose: {
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  info: {
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  gris: { colorClasses: "bg-neutral-primary-soft border-default text-heading" },
  slate: {
    colorClasses:
      "bg-neutral-secondary-medium border-default-medium text-heading",
  },
  morado: {
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  indigo: {
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
};

/** Estado de selección de criterio en el wizard de compromisos */
export const CRITERIO_SELECTION_STATUS_BADGE: Record<
  "seleccionado" | "pendiente",
  StatusBadgeConfig
> = {
  seleccionado: {
    label: "Seleccionado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  pendiente: {
    label: "Pendiente",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
};

/** Estado global del compromiso de mejora */
export const COMPROMISO_STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  Pendiente: {
    label: "Pendiente",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  "En Progreso": {
    label: "En Progreso",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  Completado: {
    label: "Completado",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  Vencido: {
    label: "Vencido",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
};

export const AUDIT_ACTION_BADGE: Record<string, StatusBadgeConfig> = {
  crear: {
    label: "Crear",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  editar: {
    label: "Editar",
    colorClasses: "bg-warning-soft border-warning-subtle text-fg-warning",
  },
  eliminar: {
    label: "Eliminar",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  consultar: {
    label: "Consultar",
    colorClasses:
      "bg-neutral-secondary-medium border-default-medium text-heading",
  },
  login: {
    label: "Login",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  logout: {
    label: "Logout",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  login_fallido: {
    label: "Login fallido",
    colorClasses: "bg-danger-soft border-danger-subtle text-fg-danger-strong",
  },
  activar: {
    label: "Activar",
    colorClasses:
      "bg-success-soft border-success-subtle text-fg-success-strong",
  },
  desactivar: {
    label: "Desactivar",
    colorClasses: "bg-neutral-primary-soft border-default text-heading",
  },
  asignar_rol: {
    label: "Asignar rol",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  asignar_permisos: {
    label: "Asignar permisos",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  exportar: {
    label: "Exportar",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
  asignar: {
    label: "Asignar",
    colorClasses: "bg-brand-softer border-brand-subtle text-fg-brand-strong",
  },
};
