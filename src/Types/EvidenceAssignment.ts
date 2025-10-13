/**
 * Tipos para la funcionalidad de asignación de evidencias
 */

export interface Criterion {
  criterio_id: number;
  componente_id: number;
  comentario_id?: number;
  descripcion: string;
  nomenclatura: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Evidence {
  evidencia_id: number;
  criterio_id: number;
  estado_evidencia_id: number;
  descripcion: string;
  nomenclatura: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Process {
  proceso_id: number;
  ciclo_acreditacion_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface EvidenceAssignmentFormData {
  proceso_id: number | null;
  criterio_id: number | null;
  selectedEvidences: number[];
  selectedUsers: number[];
  selectedRoles: number[];
  fecha_limite?: string;
  comentario?: string;
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
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido';
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