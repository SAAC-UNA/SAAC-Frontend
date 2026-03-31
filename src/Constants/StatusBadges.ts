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

/** Config de solo color — para badges sin label fijo (recursos, roles, tipos, etc.) */
export interface BadgeColorConfig {
  colorClasses: string;
}

/** Estados de publicación de evidencia — enum PascalCase (EVIDENCIA.estado) */
export const EVIDENCE_STATUS_BADGE: Record<EvidencePublicationStatus, StatusBadgeConfig> = {
  'Pendiente': { label: 'Pendiente', colorClasses: 'bg-slate-light text-slate' },
  'En Proceso': { label: 'En proceso', colorClasses: 'bg-warning-light text-warning' },
  'Aprobado': { label: 'Aprobado', colorClasses: 'bg-verde-light text-verde' },
  'Rechazado': { label: 'Rechazado', colorClasses: 'bg-error-light text-error' },
  'Completado': { label: 'Completado', colorClasses: 'bg-teal-light text-teal' },
  'Vencido': { label: 'Vencido', colorClasses: 'bg-rose-light text-rose' },
  'Observada': { label: 'Observada', colorClasses: 'bg-naranja-light text-naranja' },
  'Validada': { label: 'Validada', colorClasses: 'bg-info-light text-info' },
};

/** Estados de asignación de evidencia a responsable */
export const ASSIGNMENT_STATUS_BADGE: Record<AssignmentStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: 'bg-slate-light text-slate' },
  en_progreso: { label: 'En progreso', colorClasses: 'bg-warning-light text-warning' },
  completado: { label: 'Completado', colorClasses: 'bg-teal-light text-teal' },
  vencido: { label: 'Vencido', colorClasses: 'bg-rose-light text-rose' },
};

/** Estados de solicitud de ampliación de plazo */
export const EXTENSION_REQUEST_STATUS_BADGE: Record<ExtensionRequestStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: 'bg-slate-light text-slate' },
  aprobada:  { label: 'Aprobado',  colorClasses: 'bg-verde-light text-verde' },
  rechazada: { label: 'Rechazado', colorClasses: 'bg-error-light text-error' },
};

/** Estado activo/inactivo de un usuario */
export const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  active:   { label: 'Activo',   colorClasses: 'bg-verde-light text-verde' },
  inactive: { label: 'Inactivo', colorClasses: 'bg-error-light text-error' },
};

/** Paleta de colores del sistema — bg light + texto tono 400
 * Úsala para asignar colores a cualquier badge dinámicamente. */
export const BADGE_COLORS: Record<string, BadgeColorConfig> = {
  verde:   { colorClasses: 'bg-verde-light text-verde' },
  teal:    { colorClasses: 'bg-teal-light text-teal' },
  warning: { colorClasses: 'bg-warning-light text-warning' },
  naranja: { colorClasses: 'bg-naranja-light text-naranja' },
  error:   { colorClasses: 'bg-error-light text-error' },
  rose:    { colorClasses: 'bg-rose-light text-rose' },
  info:    { colorClasses: 'bg-info-light text-info' },
  gris:    { colorClasses: 'bg-gris-light text-gris-una' },
  slate:   { colorClasses: 'bg-slate-light text-slate' },
  morado:  { colorClasses: 'bg-morado-light text-morado' },
  indigo:  { colorClasses: 'bg-indigo-light text-indigo' },
};

/** Tipos de acción de la bitácora del sistema */
export const AUDIT_ACTION_BADGE: Record<string, StatusBadgeConfig> = {
  crear: { label: 'Crear', colorClasses: 'bg-teal-light text-teal' },
  editar: { label: 'Editar', colorClasses: 'bg-warning-light text-warning' },
  eliminar: { label: 'Eliminar', colorClasses: 'bg-error-light text-error' },
  consultar: { label: 'Consultar', colorClasses: 'bg-slate-light text-slate' },
  login: { label: 'Login', colorClasses: 'bg-verde-light text-verde' },
  logout: { label: 'Logout', colorClasses: 'bg-error-light text-error' },
  login_fallido: { label: 'Login fallido', colorClasses: 'bg-rose-light text-rose' },
  activar: { label: 'Activar', colorClasses: 'bg-teal-light text-teal' },
  desactivar: { label: 'Desactivar', colorClasses: 'bg-gris-light text-gris-una' },
  asignar_rol: { label: 'Asignar rol', colorClasses: 'bg-morado-light text-morado' },
  asignar_permisos: { label: 'Asignar permisos', colorClasses: 'bg-indigo-light text-indigo' },
  exportar: { label: 'Exportar', colorClasses: 'bg-teal-light text-teal' },
  asignar: { label: 'Asignar', colorClasses: 'bg-info-light text-info' },
};
