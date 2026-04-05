/**
 * StructureModelTypes - Tipos para modelos de estructura y elementos flexibles
 */

export interface TipoJerarquia {
  tipo: string;
  padre_tipo: string | null;
}

export interface StructureModel {
  modelo_estructura_id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'tradicional' | 'elemento_flexible';
  version: string | null;
  activo: boolean;
  tipos_jerarquia: TipoJerarquia[] | null;
  tipos_asignables: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface FlexibleElement {
  elemento_id: number;
  modelo_estructura_id: number;
  padre_id: number | null;
  tipo: string;
  nombre: string | null;
  categoria: 'A' | 'B' | 'C' | 'D' | null;
  nomenclatura: string | null;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModelForm {
  nombre: string;
  descripcion?: string;
  version?: string;
  tipos_jerarquia?: TipoJerarquia[];
  tipos_asignables?: string[];
}

export interface EditModelForm {
  nombre?: string;
  descripcion?: string;
  version?: string;
  tipos_jerarquia?: TipoJerarquia[];
}

export interface CreateFlexibleElementForm {
  modelo_estructura_id: number;
  padre_id?: number | null;
  tipo: string;
  nombre?: string;
  categoria?: 'A' | 'B' | 'C' | 'D' | null;
  nomenclatura?: string;
  descripcion?: string;
}

export interface EditFlexibleElementForm {
  tipo?: string;
  nombre?: string;
  categoria?: 'A' | 'B' | 'C' | 'D' | null;
  nomenclatura?: string;
  descripcion?: string;
}
