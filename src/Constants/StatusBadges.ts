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
  'Pendiente': { label: 'Pendiente', colorClasses: 'bg-slate-ring text-slate' },
  'En Proceso': { label: 'En proceso', colorClasses: 'bg-warning-ring text-warning' },
  'Aprobado': { label: 'Aprobado', colorClasses: 'bg-verde-ring text-verde' },
  'Rechazado': { label: 'Rechazado', colorClasses: 'bg-error-ring text-error' },
  'Completado': { label: 'Completado', colorClasses: 'bg-verde-ring text-verde' },
  'Vencido': { label: 'Vencido', colorClasses: 'bg-rose-ring text-rose' },
  'Observada': { label: 'Observada', colorClasses: 'bg-naranja-ring text-naranja' },
  'Validada': { label: 'Validada', colorClasses: 'bg-info-ring text-info' },
};

/** Estados de asignación de evidencia a responsable */
export const ASSIGNMENT_STATUS_BADGE: Record<AssignmentStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: 'bg-slate-ring text-slate' },
  en_progreso: { label: 'En progreso', colorClasses: 'bg-warning-ring text-warning' },
  completado: { label: 'Completado', colorClasses: 'bg-verde-ring text-verde' },
  vencido: { label: 'Vencido', colorClasses: 'bg-rose-ring text-rose' },
};

/** Estados de solicitud de ampliación de plazo */
export const EXTENSION_REQUEST_STATUS_BADGE: Record<ExtensionRequestStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: 'bg-slate-ring text-slate' },
  aprobada:  { label: 'Aprobado',  colorClasses: 'bg-verde-ring text-verde' },
  rechazada: { label: 'Rechazado', colorClasses: 'bg-error-ring text-error' },
};

/** Estado activo/inactivo de un usuario */
export const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  active:   { label: 'Activo',   colorClasses: 'bg-verde-ring text-verde' },
  inactive: { label: 'Inactivo', colorClasses: 'bg-error-ring text-error' },
};

/** Paleta de colores del sistema — bg light + texto tono 400
 * Úsala para asignar colores a cualquier badge dinámicamente. */
export const BADGE_COLORS: Record<string, BadgeColorConfig> = {
  verde:   { colorClasses: 'bg-verde-ring text-verde' },
  teal:    { colorClasses: 'bg-teal-ring text-teal' },
  warning: { colorClasses: 'bg-warning-ring text-warning' },
  naranja: { colorClasses: 'bg-naranja-ring text-naranja' },
  error:   { colorClasses: 'bg-error-ring text-error' },
  rose:    { colorClasses: 'bg-rose-ring text-rose' },
  info:    { colorClasses: 'bg-info-ring text-info' },
  gris:    { colorClasses: 'bg-gris-light text-gris-una' },
  slate:   { colorClasses: 'bg-slate-ring text-slate' },
  morado:  { colorClasses: 'bg-morado-ring text-morado' },
  indigo:  { colorClasses: 'bg-indigo-ring text-indigo' },
};

/** Estado de selección de criterio en el wizard de compromisos */
export const CRITERIO_SELECTION_STATUS_BADGE: Record<'seleccionado' | 'pendiente', StatusBadgeConfig> = {
  seleccionado: { label: 'Seleccionado', colorClasses: 'text-verde bg-verde-ring' },
  pendiente:    { label: 'Pendiente',    colorClasses: 'text-warning bg-warning-ring' },
};

/** Estado global del compromiso de mejora */
export const COMPROMISO_STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  Pendiente:     { label: 'Pendiente',    colorClasses: 'text-warning-dark bg-warning-ring' },
  'En Progreso': { label: 'En Progreso',  colorClasses: 'text-info-dark bg-info-ring' },
  Completado:    { label: 'Completado',   colorClasses: 'text-verde-dark bg-verde-ring' },
  Vencido:       { label: 'Vencido',      colorClasses: 'text-error-dark bg-error-ring' },
};

export const AUDIT_ACTION_BADGE: Record<string, StatusBadgeConfig> = {
  crear: { label: 'Crear', colorClasses: 'bg-teal-ring text-teal' },
  editar: { label: 'Editar', colorClasses: 'bg-warning-ring text-warning' },
  eliminar: { label: 'Eliminar', colorClasses: 'bg-error-ring text-error' },
  consultar: { label: 'Consultar', colorClasses: 'bg-slate-ring text-slate' },
  login: { label: 'Login', colorClasses: 'bg-verde-ring text-verde' },
  logout: { label: 'Logout', colorClasses: 'bg-error-ring text-error' },
  login_fallido: { label: 'Login fallido', colorClasses: 'bg-rose-ring text-rose' },
  activar: { label: 'Activar', colorClasses: 'bg-teal-ring text-teal' },
  desactivar: { label: 'Desactivar', colorClasses: 'bg-gris-light text-gris-una' },
  asignar_rol: { label: 'Asignar rol', colorClasses: 'bg-morado-ring text-morado' },
  asignar_permisos: { label: 'Asignar permisos', colorClasses: 'bg-indigo-ring text-indigo' },
  exportar: { label: 'Exportar', colorClasses: 'bg-teal-ring text-teal' },
  asignar: { label: 'Asignar', colorClasses: 'bg-info-ring text-info' },
};

/**
 * Retorna un color de badge determinista para un string dado.
 * El mismo valor siempre produce el mismo color (basado en hash del string).
 * Usar para categorías, tipos u otros campos sin una paleta fija.
 */
export const getBadgeColorForString = (value: string): string => {
  const keys = Object.keys(BADGE_COLORS).filter(k => k !== 'gris');
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return BADGE_COLORS[keys[hash % keys.length]].colorClasses;
};

/** Tipo de modelo de estructura (tradicional vs flexible) */
export const MODELO_TIPO_BADGE: Record<string, StatusBadgeConfig> = {
  tradicional:       { label: 'Tradicional',      colorClasses: 'bg-info-ring text-info-dark' },
  elemento_flexible: { label: 'Elemento flexible', colorClasses: 'bg-morado-ring text-morado-dark' },
};
