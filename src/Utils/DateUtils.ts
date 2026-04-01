/**
 * Utilidades centralizadas para formateo de fechas.
 * Locale estándar del proyecto: es-CR
 */

const LOCALE = 'es-CR';

/**
 * Formato numérico: 31/03/2026
 * Acepta string ISO, Date, null o undefined.
 */
export function formatDate(date?: string | null | Date): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Formato con mes abreviado: 31 mar. 2026
 * Con includeTime=true: 31 mar. 2026, 14:30
 * Acepta string ISO, Date, null o undefined.
 */
export function formatDateShort(date?: string | null | Date, includeTime = false): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(d);
}

/**
 * Formato con mes completo: 31 de marzo de 2026
 * Con includeTime=true: 31 de marzo de 2026, 14:30
 */
export function formatDateLong(date: string | Date, includeTime = false): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(d);
}

/**
 * Formato completo con día de semana y hora: martes, 31 de marzo de 2026, 14:30:00
 * Usado en el modal de detalle de bitácora.
 */
export function formatDateFull(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formato numérico con hora y segundos: 31/03/2026, 14:30:00
 * Usado en la tabla de bitácora de auditoría.
 */
export function formatDateWithTime(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formato compacto sin año: 31 mar
 * Usado en cards de Kanban y vistas reducidas.
 */
export function formatDateCompact(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
  }).format(d);
}
