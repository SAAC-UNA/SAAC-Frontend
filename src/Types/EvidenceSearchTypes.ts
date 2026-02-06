/**
 * Tipos TypeScript para Búsqueda Avanzada de Evidencias
 * Definiciones para filtros, resultados y exportación
 */

// Estados posibles de una evidencia (deben coincidir con ESTADO_EVIDENCIA del backend)
// Pendiente, En proceso, Aprobado, Rechazado, Completado, Vencido
export type EvidencePublicationStatus = 
  | 'pendiente' 
  | 'en_proceso' 
  | 'aprobado' 
  | 'rechazado' 
  | 'completado' 
  | 'vencido';

// Tipos de ordenamiento disponibles
export type SortField = 'fecha_publicacion' | 'criterio' | 'responsable' | 'estado';
export type SortDirection = 'asc' | 'desc';

// Formatos de exportación disponibles
export type ExportFormat = 'pdf' | 'excel';

// Estructura de filtros para búsqueda avanzada
export interface EvidenceSearchFilters {
  // Filtro por criterio (nomenclatura)
  criterio?: string | null;
  
  // Filtro por responsable de publicación
  responsable_id?: number | null;
  
  // Filtro por rango de fechas de publicación
  fecha_publicacion_desde?: string | null; // YYYY-MM-DD
  fecha_publicacion_hasta?: string | null; // YYYY-MM-DD
  
  // Filtro por estado
  estado?: EvidencePublicationStatus | 'todos';
  
  // Filtro por rol (para ver evidencias según permisos)
  rol_id?: number | null;
  
  // Búsqueda general por texto
  busqueda_general?: string;
}

// Parámetros de ordenamiento
export interface SortParams {
  field: SortField;
  direction: SortDirection;
}

// Parámetros de paginación
export interface PaginationParams {
  page: number;
  per_page: number;
}

// Resultado de búsqueda de evidencia individual
export interface EvidenceSearchResult {
  evidencia_id: number;
  criterio_nomenclatura: string;
  criterio_descripcion: string;
  descripcion: string;
  fecha_publicacion: string; // ISO 8601
  estado: EvidencePublicationStatus;
  
  // Información del responsable
  responsable: {
    usuario_id: number;
    nombre: string;
    email: string;
  };
  
  // Información de archivos/enlaces asociados
  archivos_count: number;
  enlaces_count: number;
  
  // Roles que tienen acceso
  roles_acceso: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// Respuesta paginada de la API
export interface EvidenceSearchResponse {
  data: EvidenceSearchResult[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Parámetros completos para la búsqueda
export interface EvidenceSearchParams {
  filters: EvidenceSearchFilters;
  sort: SortParams;
  pagination: PaginationParams;
}

// Request de exportación
export interface ExportRequest {
  filters: EvidenceSearchFilters;
  sort: SortParams;
  format: ExportFormat;
}

// Respuesta de exportación
export interface ExportResponse {
  success: boolean;
  message: string;
  file_url?: string;
  file_name?: string;
}

// Opciones para selectores de filtros
export interface FilterOption<T = string | number> {
  value: T;
  label: string;
}

// Estado del componente de búsqueda
export interface EvidenceSearchState {
  results: EvidenceSearchResult[];
  filters: EvidenceSearchFilters;
  sort: SortParams;
  pagination: PaginationParams;
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Helpers para trabajar con estados de evidencias
 */
export const EVIDENCE_STATUS_LABELS: Record<EvidencePublicationStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  completado: 'Completado',
  vencido: 'Vencido'
};

export const EVIDENCE_STATUS_COLORS: Record<EvidencePublicationStatus, { bg: string; text: string }> = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  en_proceso: { bg: 'bg-blue-100', text: 'text-blue-800' },
  aprobado: { bg: 'bg-green-100', text: 'text-green-800' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-800' },
  completado: { bg: 'bg-teal-100', text: 'text-teal-800' },
  vencido: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  fecha_publicacion: 'Fecha de Publicación',
  criterio: 'Criterio',
  responsable: 'Responsable',
  estado: 'Estado'
};
