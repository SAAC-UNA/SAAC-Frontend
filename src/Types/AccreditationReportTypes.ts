/**
 * AccreditationReportTypes — Tipos para Informes de Acreditación (HU-026)
 *
 * Mapean la respuesta del backend (AccreditationReportResource).
 */

// ─── Respuesta del backend ───────────────────────────────────────────────────

export interface AccreditationReportFileApi {
  nombre_original: string;
  tipo_mime: string | null;
  tamanio: number | null;
  is_publico: boolean;
  url_publica: string | null;
}

export interface AccreditationReportApi {
  informe_archivo_id: number;
  estado: "publicado" | "despublicado";
  fecha_publicacion: string | null; // ISO 8601
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  proceso?: {
    proceso_id: number;
    nombre: string;
  };
  archivo: AccreditationReportFileApi | null;
  publicado_por?: {
    usuario_id: number;
    nombre: string;
  } | null;
}

export interface PaginatedAccreditationReports {
  data: AccreditationReportApi[];
  current_page: number;
  last_page: number;
  total: number;
}

// ─── Payload para publicar ───────────────────────────────────────────────────

export interface PublishReportPayload {
  archivo: File; // PDF
  proceso_id: number; // Proceso de autoevaluación (HU-026)
  observaciones?: string;
}

// ─── Payload para editar ──────────────────────────────────────────────────────

export interface UpdateReportPayload {
  archivo?: File; // PDF de reemplazo (opcional)
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
