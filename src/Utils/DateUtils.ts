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
 * Formato con mes abreviado y hora: 31 mar. 2026, 14:30
 * Acepta string ISO, Date, null o undefined.
 */
export function formatDateShortWithTime(date?: string | null | Date): string {
  return formatDateShort(date, true);
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
 * Formato completo con día de semana sin hora: martes, 31 de marzo de 2026
 */
export function formatDateFullNoTime(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

/**
 * Verifica si una fecha es hoy.
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Verifica si una fecha fue ayer.
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

/**
 * Tiempo relativo al momento actual: "hace 5 minutos", "hace 2 horas", "ayer", etc.
 * Usa Intl.RelativeTimeFormat con locale es-CR.
 */
export function formatTimeAgo(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = d.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));

  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
  return rtf.format(diffYears, 'year');
}
