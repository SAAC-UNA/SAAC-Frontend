/**
 * Tipos TypeScript para Solicitudes de Ampliación (HU-016)
 * Corresponde al modelo ExtensionRequest del backend
 */
import { formatDate } from '@/Utils/DateUtils';

// Estados posibles de una solicitud de ampliación
export type ExtensionRequestStatus = 'pendiente' | 'aprobada' | 'rechazada';

// Modelo completo de solicitud de ampliación
export interface ExtensionRequest {
  solicitud_ampliacion_id: number;
  evidencia_asignacion_id: number | null;
  elemento_asignacion_id: number | null;
  usuario_id: number;
  motivo: string;
  fecha_sugerida: string; // ISO 8601
  estado: ExtensionRequestStatus;
  fecha_resolucion: string | null; // ISO 8601
  usuario_resolutor_id: number | null;
  justificacion: string | null;
  created_at: string;
  updated_at: string;

  // Relaciones opcionales (cuando están cargadas)
  evidencia_asignacion?: {
    evidencia_asignacion_id: number;
    evidencia_id: number;
    proceso_id?: number;
    estado: string;
    fecha_limite: string;
    evidencia?: {
      evidencia_id: number;
      nomenclatura: string;
      descripcion: string;
    };
    process?: {
      proceso_id: number;
      nombre?: string;
      ciclo_acreditacion_id?: number;
    };
  };

  elemento_asignacion?: {
    elemento_asignacion_id: number;
    elemento_id: number;
    proceso_id: number;
    estado: string;
    fecha_limite: string | null;
    process?: {
      proceso_id: number;
      nombre?: string;
      ciclo_acreditacion_id?: number;
    };
  };

  usuario?: {
    usuario_id: number;
    nombre: string;
    email: string;
  };

  resolutor?: {
    usuario_id: number | null;
    nombre: string | null;
    email: string | null;
  };
}

// Request para crear una solicitud de ampliación
export interface CreateExtensionRequestData {
  evidencia_asignacion_id: number;
  motivo: string;
  fecha_sugerida: string; // YYYY-MM-DD
}

// Request para aprobar/rechazar una solicitud
export interface ReviewExtensionRequestData {
  justificacion?: string;
}

// Respuesta del backend al crear una solicitud
export interface ExtensionRequestApiResponse {
  message: string;
  data: ExtensionRequest;
}

// Respuesta paginada del backend
export interface ExtensionRequestPaginatedResponse {
  data: ExtensionRequest[];
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

// Filtros para listar solicitudes
export interface ExtensionRequestFilters {
  estado?: ExtensionRequestStatus;
  usuario_id?: number;
  evidencia_asignacion_id?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  per_page?: number;
  page?: number;
}

// Estado del formulario para crear solicitud
export interface ExtensionRequestFormData {
  evidencia_asignacion_id: number;
  motivo: string;
  fecha_sugerida: string;
}

// Estado del formulario para aprobar/rechazar
export interface ReviewFormData {
  justificacion: string;
}

/**
 * Filtra solicitudes de ampliación por estado y término de búsqueda.
 * Cubre todos los campos visibles en la tabla.
 */
export function filterExtensionRequests(
  requests: ExtensionRequest[],
  searchQuery: string,
  filterEstado: ExtensionRequestStatus | 'todos'
): ExtensionRequest[] {
  let filtered = requests;

  if (filterEstado !== 'todos') {
    filtered = filtered.filter(req => req.estado === filterEstado);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(req =>
      req.motivo.toLowerCase().includes(q) ||
      req.solicitud_ampliacion_id.toString().includes(q) ||
      req.usuario?.nombre?.toLowerCase().includes(q) ||
      req.usuario?.email?.toLowerCase().includes(q) ||
      req.estado.toLowerCase().includes(q) ||
      formatDate(req.fecha_sugerida).includes(q) ||
      formatDate(req.created_at).includes(q)
    );
  }

  return filtered;
}
