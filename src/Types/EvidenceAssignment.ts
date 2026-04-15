/**
 * Tipos para la funcionalidad de asignación de evidencias
 */

export interface Criterion {
  criterio_id: number;
  componente_id: number;
  comentario_id?: number;
  descripcion: string;
  nomenclatura: string;
  estado?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Evidence {
  evidencia_id: number;
  criterio_id: number;
  estado: string;
  descripcion: string;
  nomenclatura: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Process {
  proceso_id: number;
  nombre: string;
  tipo_proceso?: string;
  ciclo_acreditacion_id: number;
  ciclo_nombre?: string;
  modelo_estructura_id?: number;
  modelo_estructura_tipo?: string;
  created_at?: string;
  updated_at?: string;
}

/** Ciclo de acreditación con tipo de modelo, retornado por GET /api/usuarios/{id}/mis-ciclos */
export interface UserCycle {
  ciclo_acreditacion_id: number;
  nombre: string;
  tipo_modelo: "tradicional" | "elemento_flexible";
}

export interface EvidenceAssignmentFormData {
  proceso_id: number | null;
  criterio_id: number | null;
  selectedCriteria: number[];
  selectedEvidences: number[];
  /** Modo flexible: IDs de elementos seleccionados para asignar */
  selectedElements: number[];
  selectedUsers: number[];
  selectedRoles: number[];
  fecha_limite?: string;
  comentario?: string;
  excludedUsers?: number[];
}

export interface EvidenceAssignmentRequest {
  proceso_id: number;
  evidencia_id: number;
  usuarios?: number[];
  roles?: number[];
  fecha_limite?: string;
  comentario?: string;
}

export interface EvidenceAssignmentResponse {
  evidencia_asignacion_id: number;
  proceso_id: number;
  evidencia_id: number;
  usuario_id: number;
  estado: "pendiente" | "en_progreso" | "completado" | "vencido";
  fecha_asignacion: string;
  fecha_limite?: string;
  created_at: string;
  updated_at: string;
  proceso?: {
    proceso_id: number;
    ciclo_acreditacion_id: number;
  };
  evidencia?: Evidence;
  usuario?: {
    usuario_id: number;
    nombre: string;
    email: string;
  };
}

export interface EvidenceAssignmentApiResponse {
  message: string;
  data: {
    total_asignaciones: number;
    total_errores: number;
    asignaciones: EvidenceAssignmentResponse[];
    errores: string[];
  };
}

export interface WizardStep {
  id: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Tipos para validación de asignaciones duplicadas
 */
export interface DuplicateAssignment {
  usuario_id: number;
  usuario_nombre: string;
  evidencia_id: number;
  estado: "pendiente" | "en_progreso" | "completado" | "vencido";
  fecha_asignacion: string;
  asignacion_id?: number;
}

export interface DuplicateValidationRequest {
  proceso_id: number;
  evidencia_id: number;
  usuarios: number[];
}

export interface DuplicateValidationResponse {
  tiene_duplicados: boolean;
  duplicados: DuplicateAssignment[];
  total_duplicados: number;
}

/**
 * Asignación de elemento (modelo flexible) — respuesta de
 * GET /api/usuarios/{id}/elementos-asignados
 */
export interface FlexibleAssignmentItem extends Record<string, unknown> {
  elemento_asignacion_id: number;
  elemento_id: number;
  usuario_id: number;
  proceso_id: number;
  /** PascalCase: 'Pendiente' | 'En Progreso' | 'Completado' | 'Vencido' | 'Observada' | 'Validada' */
  estado: string;
  fecha_limite: string | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
  has_pending_extension_request?: boolean;
  pending_extension_request_id?: number | null;
  has_uploaded_files?: boolean;
  is_returned_for_changes?: boolean;
  element?: {
    elemento_id: number;
    nombre: string;
    tipo: string;
    descripcion?: string | null;
    nomenclatura?: string | null;
  };
  process?: {
    proceso_id: number;
    nombre: string;
    ciclo_acreditacion_id?: number;
    modelo_estructura_id?: number;
  };
  user?: {
    usuario_id: number;
    nombre: string;
  };
  comments?: Array<{
    id: number;
    texto: string;
    autor: string;
    fecha: string;
  }>;
}

/**
 * Filtra asignaciones del modelo flexible por texto de búsqueda.
 * Cubre todas las columnas visibles: nombre/nomenclatura de pauta,
 * proceso, estado y fecha límite.
 */
export function filterFlexAssignments(
  assignments: FlexibleAssignmentItem[],
  search?: string,
): FlexibleAssignmentItem[] {
  if (!search?.trim()) return assignments;
  const term = search.toLowerCase().trim();
  return assignments.filter((a) => {
    const fechaStr = a.fecha_limite
      ? new Intl.DateTimeFormat('es-CR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(a.fecha_limite))
      : '';
    return (
      a.element?.nombre?.toLowerCase().includes(term) ||
      a.element?.nomenclatura?.toLowerCase().includes(term) ||
      a.element?.descripcion?.toLowerCase().includes(term) ||
      a.process?.nombre?.toLowerCase().includes(term) ||
      a.estado?.toLowerCase().includes(term) ||
      fechaStr.includes(term)
    );
  });
}
