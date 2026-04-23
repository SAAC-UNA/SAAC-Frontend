/**
 * AccreditationReportTypes — Tipos para Informes de Acreditación (HU-027)
 *
 * Mapean la respuesta del backend (AccreditationReportResource).
 */

// ─── Respuesta del backend ───────────────────────────────────────────────────

export interface AccreditationReportFileApi {
  archivo_id: number;
  nombre_original: string;
  tipo_mime: string | null;
  tamanio: number | null;
  is_publico: boolean;
  url_publica: string | null;
}

export interface AccreditationReportApi {
  informe_acreditacion_id: number;
  estado: 'publicado' | 'despublicado';
  is_vigente: boolean;
  esta_acreditada: boolean;
  numero_resolucion: string;
  fecha_resolucion: string;       // Y-m-d
  vigencia_desde: string;         // Y-m-d
  vigencia_hasta: string;         // Y-m-d
  fecha_publicacion: string | null; // ISO 8601
  observaciones: string | null;
  archivo: AccreditationReportFileApi | null;
  publicado_por: { usuario_id: number; nombre: string } | null;
}

export interface PaginatedAccreditationReports {
  data: AccreditationReportApi[];
  current_page: number;
  last_page: number;
  total: number;
}

// ─── Payload para publicar ───────────────────────────────────────────────────

export interface PublishReportPayload {
  archivo: File;               // PDF
  numero_resolucion: string;
  vigencia_desde: string;      // Y-m-d
  vigencia_hasta: string;      // Y-m-d
  esta_acreditada: boolean;
  observaciones?: string;
}

// ─── Payload para editar ──────────────────────────────────────────────────────

export interface UpdateReportPayload {
  archivo?: File;              // PDF de reemplazo (opcional)
  numero_resolucion?: string;
  vigencia_desde?: string;     // Y-m-d
  vigencia_hasta?: string;     // Y-m-d
  esta_acreditada?: boolean;
  observaciones?: string | null;
}

// ─── Filtros de listado público ───────────────────────────────────────────────

export interface ListReportsParams {
  carrera_id?: number;
  sede_id?: number;
  carrera_campus_id?: number;
  per_page?: number;
  include_unpublished?: boolean;
}
