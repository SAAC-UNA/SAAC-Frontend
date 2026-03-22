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
  criterio_id: number;
  // Nomenclatura propia de la evidencia (ej. "E-001")
  nomenclatura: string;
  criterio_nomenclatura: string;
  criterio_descripcion: string;
  descripcion: string;
  fecha_publicacion: string; // ISO 8601
  estado: EvidencePublicationStatus;
  
  // Información de responsables (puede ser array vacío si no hay asignados)
  responsables: Array<{
    usuario_id: number;
    nombre: string;
    email: string;
  }>;
  
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

// Clases badge usando las variables CSS definidas en index.css
export const EVIDENCE_STATUS_BADGE: Record<EvidencePublicationStatus, string> = {
  pendiente: 'bg-[var(--color-gris-light)] text-gris-una',
  en_proceso: 'bg-[var(--color-warning-ring)] text-warning-dark',
  aprobado: 'bg-[var(--color-verde-ring)] text-verde-dark',
  rechazado: 'bg-[var(--color-error-ring)] text-error-dark',
  completado: 'bg-[var(--color-info-ring)] text-info-dark',
  vencido: 'bg-[var(--color-error-ring)] text-error'
};

// Mantener compatibilidad con código existente (deprecated - usar EVIDENCE_STATUS_BADGE)

/**
 * Filtra localmente los resultados de búsqueda según un término de texto.
 * Cubre todos los campos visibles en la tabla.
 */
export function filterEvidenceResults(
  results: EvidenceSearchResult[],
  searchTerm: string
): EvidenceSearchResult[] {
  if (!searchTerm.trim()) return results;

  const term = searchTerm.toLowerCase();

  return results.filter((item) => {
    const fechaFormateada = new Date(item.fecha_publicacion).toLocaleDateString('es-CR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const archivosText = item.archivos_count > 0
      ? `${item.archivos_count} ${item.archivos_count === 1 ? 'archivo' : 'archivos'}`
      : '';
    const enlacesText = item.enlaces_count > 0
      ? `${item.enlaces_count} ${item.enlaces_count === 1 ? 'enlace' : 'enlaces'}`
      : '';
    const sinRecursos = item.archivos_count === 0 && item.enlaces_count === 0 ? 'sin recursos' : '';

    return (
      item.descripcion.toLowerCase().includes(term) ||
      item.nomenclatura.toLowerCase().includes(term) ||
      item.criterio_nomenclatura.toLowerCase().includes(term) ||
      item.criterio_descripcion.toLowerCase().includes(term) ||
      item.estado.toLowerCase().includes(term) ||
      fechaFormateada.includes(term) ||
      archivosText.includes(term) ||
      enlacesText.includes(term) ||
      sinRecursos.includes(term) ||
      item.responsables.some(r => r.nombre.toLowerCase().includes(term)) ||
      item.responsables.some(r => r.email.toLowerCase().includes(term)) ||
      item.roles_acceso.some(r => r.toLowerCase().includes(term))
    );
  });
}
