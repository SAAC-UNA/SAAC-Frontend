/**
 * AccreditationCycleTypes - Tipos para Ciclos de Acreditación (HU-030)
 */

export type AccreditationCycleStatus = "activo" | "inactivo" | "completado";

export interface AccreditationCycle {
  ciclo_acreditacion_id: number;
  carrera_sede_id: number;
  modelo_estructura_id: number;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
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
  carrera_id: number;
  sede_id: number;
  carrera_nombre: string;
  sede_nombre: string;
}

export interface CreateAccreditationCycleForm {
  carrera_sede_id: number;
  modelo_estructura_id: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface EditAccreditationCycleForm {
  carrera_sede_id?: number;
  modelo_estructura_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: AccreditationCycleStatus;
}
