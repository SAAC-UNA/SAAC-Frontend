/**
 * AccreditationCycleTypes - Tipos para Ciclos de Acreditación (HU-030)
 */

export type AccreditationCycleStatus = 'activo' | 'inactivo' | 'completado';

export interface AccreditationCycle {
  ciclo_acreditacion_id: number;
  carrera_sede_id: number;
  modelo_estructura_id: number;
  nombre: string;
  estado: AccreditationCycleStatus;
  created_at: string;
  updated_at: string;
  carrera_sede?: {
    carrera_sede_id: number;
    sede_id: number;
    carrera_id: number;
    carrera_nombre?: string;
    sede_nombre?: string;
  };
  modelo_estructura?: {
    modelo_estructura_id: number;
    nombre: string;
    tipo: string;
    version: string | null;
  };
}

export interface CareerCampus {
  carrera_sede_id: number;
  carrera_nombre: string;
  sede_nombre: string;
}

export interface CreateAccreditationCycleForm {
  nombre: string;
  carrera_sede_id: number;
  modelo_estructura_id: number;
}

export interface EditAccreditationCycleForm {
  nombre?: string;
  carrera_sede_id?: number;
  modelo_estructura_id?: number;
  estado?: AccreditationCycleStatus;
}
