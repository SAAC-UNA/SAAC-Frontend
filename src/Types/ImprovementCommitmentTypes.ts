/**
 * Tipos TypeScript para el módulo de Compromisos de Mejora
 */

// ============================================
// Estados del Compromiso
// ============================================
export type CompromisoEstado = 'Pendiente' | 'En Progreso' | 'Completado' | 'Vencido';

// ============================================
// Tipos de Entidad para Selecciones
// ============================================
export type EntidadTipo = 'ESTANDAR' | 'DIMENSION' | 'COMPONENTE' | 'CRITERIO' | 'EVIDENCIA';

// ============================================
// Interfaces de Respuesta del Backend
// ============================================

export interface CicloAcreditacion {
  ciclo_acreditacion_id: number;
  carrera_campus_id?: number;
  carrera_sede_id?: number;
  anio?: number;
  nombre?: string;
  activo: boolean;
  careerCampus?: {
    carrera_campus_id: number;
    career?: {
      carrera_id: number;
      nombre: string;
    };
    campus?: {
      campus_id: number;
      nombre: string;
    };
  };
}

export interface Criterio {
  criterio_id: number;
  nomenclatura: string;
  descripcion: string;
  componente_id: number;
  activo: boolean;
  component?: {
    componente_id: number;
    nombre: string;
    nomenclatura: string;
    dimension?: {
      dimension_id: number;
      nombre: string;
      nomenclatura: string;
    };
  };
}

export interface Evidencia {
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  activo: boolean;
}

export interface Usuario {
  usuario_id: number;
  nombre: string;
  email: string;
  estado: string;
  roles?: Array<{
    id: number;
    name: string;
  }>;
}

export interface Rol {
  id: number;
  name: string;
}

export interface EvidenciaAsignada {
  evidencia_asignacion_id: number;
  evidencia_id: number;
  usuario_id: number;
  estado: string;
  fecha_limite?: string;
  comentario?: string;
  usuario?: Usuario;
  evidencia?: Evidencia;
}

export interface Seleccion {
  tipo: EntidadTipo;
  criterio?: {
    criterio_id: number;
    nomenclatura: string;
    descripcion: string;
  };
  componente?: {
    componente_id: number;
    nombre: string;
    nomenclatura: string;
  };
  dimension?: {
    dimension_id: number;
    nombre: string;
    nomenclatura: string;
  };
  estandares?: Array<{
    estandar_id: number;
    descripcion: string;
  }>;
  evidencias?: Array<{
    evidencia_id: number;
    nomenclatura: string;
    descripcion: string;
  }>;
}

export interface CompromisoMejora {
  compromiso_mejora_id: number;
  proceso_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: CompromisoEstado;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  is_overdue?: boolean;
  selecciones?: Seleccion[];
  assignedEvidences?: EvidenciaAsignada[];
  process?: {
    proceso_id: number;
    nombre: string;
    ciclo_acreditacion_id: number;
    accreditationCycle?: CicloAcreditacion;
  };
  [key: string]: unknown;
}

// ============================================
// Interfaces para el Formulario
// ============================================

export interface SeleccionFormulario {
  entidad_tipo: EntidadTipo;
  entidad_id: number;
}

export interface EvidenciaAsignar {
  evidencia_id: number;
  usuarios: number[];
  roles?: number[];
  fecha_limite?: string;
  comentario?: string;
}

export interface CriterioSeleccionado {
  criterio_id: number;
  criterio: Criterio;
  evidencias_seleccionadas: number[]; // IDs de evidencias
  encargados_usuarios: number[]; // IDs de usuarios
  encargados_roles: number[]; // IDs de roles
  fecha_limite?: string;
  comentario?: string;
}

export interface CompromisoFormData {
  ciclo_acreditacion_id: number | null;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  criterios_seleccionados: CriterioSeleccionado[];
}

// ============================================
// Payload para el Backend
// ============================================

export interface CrearCompromisoPayload {
  ciclo_acreditacion_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  selecciones: SeleccionFormulario[];
  evidencias_asignar: EvidenciaAsignar[];
}

export interface ActualizarCompromisoPayload {
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: CompromisoEstado;
  evidencias_asignar?: EvidenciaAsignar[];
}

// ============================================
// Errores de Validación
// ============================================

export interface ValidationErrors {
  ciclo_acreditacion_id?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  criterios?: string;
  general?: string;
}

// ============================================
// Respuesta de la API
// ============================================

export interface CompromisoResponse {
  data: CompromisoMejora;
  message?: string;
}

export interface CompromisoListResponse {
  data: CompromisoMejora[];
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
