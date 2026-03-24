/**
 * StatusBadges - Configuración centralizada de badges de estado
 * Fuente única de verdad para labels y colores de todos los estados del sistema.
 */

import type { EvidencePublicationStatus } from '@/Types/EvidenceSearchTypes';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import type { ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';

export interface StatusBadgeConfig {
  label: string;
  colorClasses: string;
}

/** Estados de publicación de evidencia — enum PascalCase (EVIDENCIA.estado) */
export const EVIDENCE_STATUS_BADGE: Record<EvidencePublicationStatus, StatusBadgeConfig> = {
  'Pendiente':  { label: 'Pendiente',   colorClasses: 'bg-warning-ring text-warning-dark' },
  'En Proceso': { label: 'En proceso',  colorClasses: 'bg-info-ring text-info-dark' },
  'Aprobado':   { label: 'Aprobado',    colorClasses: 'bg-teal-light text-teal-dark' },
  'Rechazado':  { label: 'Rechazado',   colorClasses: 'bg-error-ring text-error-dark' },
  'Completado': { label: 'Completado',  colorClasses: 'bg-verde-ring text-verde-dark' },
  'Vencido':    { label: 'Vencido',     colorClasses: 'bg-error-ring text-error-dark' },
  'Observada':  { label: 'Observada',   colorClasses: 'bg-morado-ring text-morado-dark' },
  'Validada':   { label: 'Validada',    colorClasses: 'bg-teal-light text-teal-dark' },
};

/** Estados de asignación de evidencia a responsable */
export const ASSIGNMENT_STATUS_BADGE: Record<AssignmentStatus, StatusBadgeConfig> = {
  pendiente:   { label: 'Pendiente',   colorClasses: 'bg-warning-ring text-warning-dark' },
  en_progreso: { label: 'En progreso', colorClasses: 'bg-info-ring text-info-dark' },
  completado:  { label: 'Completado',  colorClasses: 'bg-verde-ring text-verde-dark' },
  vencido:     { label: 'Vencido',     colorClasses: 'bg-error-ring text-error-dark' },
};

/** Estados de solicitud de ampliación de plazo */
export const EXTENSION_REQUEST_STATUS_BADGE: Record<ExtensionRequestStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: 'bg-warning-ring text-warning-dark' },
  aprobada:  { label: 'Aprobada',  colorClasses: 'bg-verde-ring text-verde-dark' },
  rechazada: { label: 'Rechazada', colorClasses: 'bg-error-ring text-error-dark' },
};
