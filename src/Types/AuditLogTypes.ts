/**
 * Tipos para la Bitácora del Sistema (HU-005)
 */
import { formatDateWithTime } from '@/Utils/DateUtils';

/**
 * Tipo de acción registrada en la bitácora
 */
export interface ActionType {
  tipo_accion_id: number;
  descripcion: string;
  label?: string;
}

/**
 * Usuario que ejecutó la acción
 */
export interface AuditLogUser {
  nombre: string;
  email: string;
  roles?: string[];
}

/**
 * Registro individual de la bitácora
 */
export interface AuditLog {
  bitacora_id: number;
  usuario: AuditLogUser | null; // Puede ser null en login_fallido
  tipo_accion: ActionType;
  modulo: string | null;
  detalle: string | null;
  fecha_hora: string; // ISO 8601 timestamp
  created_at: string;
}

/**
 * Filtros para consultar la bitácora
 */
export interface AuditLogFilters {
  usuario_id?: number;
  tipo_accion_id?: number;
  tipo_accion?: string; // Nombre de la acción (ej: "crear", "login")
  modulo?: string;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  search?: string; // Búsqueda libre (nombre, email, acción, módulo, detalle)
  page?: number;
  per_page?: number;
}

/**
 * Respuesta paginada del backend para la bitácora
 */
export interface AuditLogPaginatedResponse {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * Opciones de exportación
 */
export type ExportFormat = 'pdf' | 'excel';

/**
 * Estado del componente de bitácora
 */
export interface AuditLogState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

/**
 * Formatea una fecha ISO a fecha + hora legible (estándar del proyecto, es-CR)
 * Retorna string con formato "dd/mm/yyyy, hh:mm:ss" separable por ", "
 */
/**
 * Filtra logs de bitácora localmente según un término de búsqueda.
 * Cubre todos los campos visibles en la tabla.
 */
export function filterAuditLogs(logs: AuditLog[], searchTerm: string): AuditLog[] {
  if (!searchTerm.trim()) return logs;

  const term = searchTerm.toLowerCase();

  return logs.filter(log => {
    const fechaFormateada = formatDateWithTime(log.fecha_hora).toLowerCase();
    return (
      log.usuario?.nombre?.toLowerCase().includes(term) ||
      log.usuario?.email?.toLowerCase().includes(term) ||
      log.modulo?.toLowerCase().includes(term) ||
      log.tipo_accion?.descripcion?.toLowerCase().includes(term) ||
      log.detalle?.toLowerCase().includes(term) ||
      fechaFormateada.includes(term)
    );
  });
}
