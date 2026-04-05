export interface AccreditationCycle {
  id: string;
  name: string;
  careerName?: string;
  campusName?: string;
  modeloEstructuraId?: string;
  modeloEstructuraTipo?: string;
  [key: string]: unknown;
}

export type AccreditationProcessStatus = "activo" | "inactivo";

export interface AccreditationProcess {
  id: string;
  type: string;
  accreditationCycleId: string;
  accreditationCycleName: string;
  careerName?: string;
  campusName?: string;
  status: AccreditationProcessStatus;
  startDate: string;
  estimatedEndDate: string;
  createdAt: string;
  updatedAt?: string;
  modeloEstructuraId?: string;
  modeloEstructuraTipo?: string;
  [key: string]: unknown;
}

export interface AccreditationProcessFormData {
  type: string;
  accreditationCycleId: string;
  status: AccreditationProcessStatus;
  startDate: string;
  estimatedEndDate: string;
}

export interface AccreditationProcessApiPayload {
  tipo_proceso: string;
  ciclo_acreditacion_id: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  activo: boolean;
}

export interface AccreditationProcessDeletePayload {
  confirmacion: string;
}
