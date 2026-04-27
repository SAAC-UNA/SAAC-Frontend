/**
 * InstitutionalStructureTypes - Tipos para Universidad, Sede y Carrera
 */

// ── Universidad ───────────────────────────────────────────────────────────────

export interface University {
  universidad_id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUniversityForm {
  nombre: string;
}

export interface UpdateUniversityForm {
  nombre: string;
}

// ── Sede (Campus) ─────────────────────────────────────────────────────────────

export interface Campus {
  sede_id: number;
  universidad_id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  university?: University;
}

export interface CreateCampusForm {
  nombre: string;
  universidad_id: number;
}

export interface UpdateCampusForm {
  nombre: string;
  universidad_id: number;
}

// ── Carrera ───────────────────────────────────────────────────────────────────

export interface Career {
  carrera_id: number;
  nombre: string;
  activo: boolean;
  universidad_id: number;
  created_at?: string;
  updated_at?: string;
  university?: University;
}

export interface CreateCareerForm {
  nombre: string;
  universidad_id: number;
}

export interface UpdateCareerForm {
  nombre: string;
  universidad_id: number;
}
