/** Valor del enum en BD; el significado de negocio de `tipo` no es solo archivo/enlace. */
export type ReportFileTipo = string;

export interface ReportFileApi {
  informe_archivo_id: number;
  nombre_original: string;
  fecha_subida: string | null;
  tipo: ReportFileTipo;
  url?: string;
  tamanio?: number;
  tipo_mime?: string;
  is_publico: boolean;
  token_publico?: string | null;
  url_publica?: string;
  url_publica_carpeta?: string;
  link_expira_en?: string | null;
  usuario_id: number;
  proceso_id: number;
  usuario?: {
    usuario_id: number;
    nombre_completo: string;
    email: string;
  };
  proceso?: {
    proceso_id: number;
    nombre: string;
  };
}

export interface ReportFileListResponse {
  success: boolean;
  data: ReportFileApi[];
  count: number;
}

export interface ReportFileSingleResponse {
  success: boolean;
  data: ReportFileApi;
  message?: string;
}
