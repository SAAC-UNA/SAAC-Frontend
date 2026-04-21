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

/** Paleta de colores del sistema — bg light + texto tono 400
 * Úsala para asignar colores a cualquier badge dinámicamente. */
export const BADGE_COLORS: Record<string, BadgeColorConfig> = {
  verde:   { colorClasses: 'bg-verde-ring text-verde' },
  teal:    { colorClasses: 'bg-teal-ring text-teal' },
  warning: { colorClasses: 'bg-warning-ring text-warning' },
  error:   { colorClasses: 'bg-error-ring text-error' },
  rose:    { colorClasses: 'bg-rose-light text-rose' },
  info:    { colorClasses: 'bg-info-ring text-info' },
  gris:    { colorClasses: 'bg-gris-light text-gris-una' },
  slate:   { colorClasses: 'bg-slate-ring text-slate' },
  morado:  { colorClasses: 'bg-morado-ring text-morado' },
  indigo:  { colorClasses: 'bg-indigo-ring text-indigo' },
};

/** Estados de publicación de evidencia — enum PascalCase (EVIDENCIA.estado) */
export const EVIDENCE_STATUS_BADGE: Record<EvidencePublicationStatus, StatusBadgeConfig> = {
  'Pendiente':  { label: 'Pendiente', colorClasses: BADGE_COLORS.gris.colorClasses },
  'En Proceso': { label: 'En proceso', colorClasses: BADGE_COLORS.warning.colorClasses },
  'Aprobado':   { label: 'Aprobado', colorClasses: BADGE_COLORS.verde.colorClasses },
  'Rechazado':  { label: 'Rechazado', colorClasses: BADGE_COLORS.error.colorClasses },
  'Completado': { label: 'Completado', colorClasses: BADGE_COLORS.verde.colorClasses },
  'Vencido':    { label: 'Vencido', colorClasses: BADGE_COLORS.rose.colorClasses },
  'Observada':  { label: 'Observada', colorClasses: BADGE_COLORS.info.colorClasses },
  'Validada':   { label: 'Validada', colorClasses: BADGE_COLORS.verde.colorClasses },
};

/** Estados de asignación de evidencia a responsable (modelo tradicional — snake_case) */
export const ASSIGNMENT_STATUS_BADGE: Record<AssignmentStatus, StatusBadgeConfig> = {
  pendiente:   { label: 'Pendiente', colorClasses: BADGE_COLORS.slate.colorClasses },
  en_progreso: { label: 'En progreso', colorClasses: BADGE_COLORS.warning.colorClasses },
  completado:  { label: 'Completado', colorClasses: BADGE_COLORS.verde.colorClasses },
  vencido:     { label: 'Vencido', colorClasses: BADGE_COLORS.rose.colorClasses },
};

/** Estados de asignación de elemento (modelo flexible — PascalCase del backend) */
export const ELEMENT_ASSIGNMENT_STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  'Pendiente':   { label: 'Pendiente',   colorClasses: BADGE_COLORS.gris.colorClasses },
  'En Progreso': { label: 'En progreso', colorClasses: BADGE_COLORS.warning.colorClasses },
  'Completado':  { label: 'Completado',  colorClasses: BADGE_COLORS.verde.colorClasses },
  'Vencido':     { label: 'Vencido',     colorClasses: BADGE_COLORS.rose.colorClasses },
};

/** Estados de solicitud de ampliación de plazo */
export const EXTENSION_REQUEST_STATUS_BADGE: Record<ExtensionRequestStatus, StatusBadgeConfig> = {
  pendiente: { label: 'Pendiente', colorClasses: BADGE_COLORS.slate.colorClasses },
  aprobada:  { label: 'Aprobada',  colorClasses: BADGE_COLORS.verde.colorClasses },
  rechazada: { label: 'Rechazada', colorClasses: BADGE_COLORS.error.colorClasses },
  cancelada: { label: 'Cancelada', colorClasses: BADGE_COLORS.gris.colorClasses },
};

/** Estado activo/inactivo de un usuario */
export const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  active:   { label: 'Activo',   colorClasses: BADGE_COLORS.verde.colorClasses },
  inactive: { label: 'Inactivo', colorClasses: BADGE_COLORS.error.colorClasses },
};

/** Estado de selección de criterio en el wizard de compromisos */
export const CRITERIO_SELECTION_STATUS_BADGE: Record<'seleccionado' | 'pendiente', StatusBadgeConfig> = {
  seleccionado: { label: 'Seleccionado', colorClasses: BADGE_COLORS.verde.colorClasses },
  pendiente:    { label: 'Pendiente',    colorClasses: BADGE_COLORS.warning.colorClasses },
};

/** Estado global del compromiso de mejora */
export const COMPROMISO_STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  Pendiente:     { label: 'Pendiente',    colorClasses: BADGE_COLORS.warning.colorClasses },
  'En Progreso': { label: 'En Progreso',  colorClasses: BADGE_COLORS.info.colorClasses },
  Completado:    { label: 'Completado',   colorClasses: BADGE_COLORS.verde.colorClasses },
  Vencido:       { label: 'Vencido',      colorClasses: BADGE_COLORS.error.colorClasses },
};

export const AUDIT_ACTION_BADGE: Record<string, StatusBadgeConfig> = {
  crear:             { label: 'Crear', colorClasses: BADGE_COLORS.teal.colorClasses },
  editar:            { label: 'Editar', colorClasses: BADGE_COLORS.warning.colorClasses },
  eliminar:          { label: 'Eliminar', colorClasses: BADGE_COLORS.error.colorClasses },
  consultar:         { label: 'Consultar', colorClasses: BADGE_COLORS.slate.colorClasses },
  login:             { label: 'Login', colorClasses: BADGE_COLORS.verde.colorClasses },
  logout:            { label: 'Logout', colorClasses: BADGE_COLORS.error.colorClasses },
  login_fallido:     { label: 'Login fallido', colorClasses: BADGE_COLORS.rose.colorClasses },
  activar:           { label: 'Activar', colorClasses: BADGE_COLORS.teal.colorClasses },
  desactivar:        { label: 'Desactivar', colorClasses: BADGE_COLORS.gris.colorClasses },
  asignar_rol:       { label: 'Asignar rol', colorClasses: BADGE_COLORS.morado.colorClasses },
  asignar_permisos:  { label: 'Asignar permisos', colorClasses: BADGE_COLORS.indigo.colorClasses },
  exportar:          { label: 'Exportar', colorClasses: BADGE_COLORS.teal.colorClasses },
  asignar:           { label: 'Asignar', colorClasses: BADGE_COLORS.info.colorClasses },
  notificar:         { label: 'Notificar', colorClasses: BADGE_COLORS.info.colorClasses },
  notificar_fallido: { label: 'Notif. fallida', colorClasses: BADGE_COLORS.rose.colorClasses },
  retroalimentar:    { label: 'Retroalimentar', colorClasses: BADGE_COLORS.morado.colorClasses },
  publicar:          { label: 'Publicar', colorClasses: BADGE_COLORS.verde.colorClasses },
  despublicar:       { label: 'Despublicar', colorClasses: BADGE_COLORS.warning.colorClasses },
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

/** Estado de enlace público en gestión de informes finales */
export type LinkStatus =
  | "completo"
  | "parcial"
  | "sin_enlaces"
  | "sin_evidencias"
  | "pendiente";

export const LINK_STATUS_BADGE: Record<LinkStatus, StatusBadgeConfig> = {
  completo:       { label: "Completo",       colorClasses: BADGE_COLORS.verde.colorClasses },
  parcial:        { label: "Parcial",        colorClasses: BADGE_COLORS.warning.colorClasses },
  sin_enlaces:    { label: "Sin enlaces",    colorClasses: BADGE_COLORS.error.colorClasses },
  sin_evidencias: { label: "Sin evidencias", colorClasses: BADGE_COLORS.gris.colorClasses },
  pendiente:      { label: "Pendiente",      colorClasses: BADGE_COLORS.gris.colorClasses },
};

/** Tipo de modelo de estructura (tradicional vs flexible) */
export const MODELO_TIPO_BADGE: Record<string, StatusBadgeConfig> = {
  tradicional:       { label: 'Tradicional',      colorClasses: BADGE_COLORS.info.colorClasses },
  elemento_flexible: { label: 'Elemento flexible', colorClasses: BADGE_COLORS.morado.colorClasses },
};
