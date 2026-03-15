/**
 * StructureMapper - Utilidades para mapear datos entre backend y frontend
 * 
 * El backend usa nombres en español (nombre, descripcion, activo, etc.)
 * y el frontend usa inglés (name, description, active, etc.)
 */

import type { ElementType, StructureElement } from '@/Types/StructureTypes';

// Mapeo de tipos del frontend a endpoints del backend
export const ELEMENT_TYPE_TO_ENDPOINT: Record<ElementType, string> = {
  university: 'universidades',
  campus: 'campuses',
  career: 'carreras',
  dimension: 'dimensiones',
  component: 'componentes',
  criteria: 'criterios',
  standard: 'estandares',
  evidence: 'evidencias',
};

// Mapeo de tipos a nombres de ID en el backend
const ELEMENT_TYPE_TO_ID_FIELD: Record<ElementType, string> = {
  university: 'universidad_id',
  campus: 'sede_id',
  career: 'carrera_id',
  dimension: 'dimension_id',
  component: 'componente_id',
  criteria: 'criterio_id',
  standard: 'estandar_id',
  evidence: 'evidencia_id',
};

// Mapeo de tipos a campo del padre
const ELEMENT_TYPE_TO_PARENT_FIELD: Record<ElementType, string | null> = {
  university: null,
  campus: 'universidad_id',
  career: 'sede_id',
  dimension: null,
  component: 'dimension_id',
  criteria: 'componente_id',
  standard: 'criterio_id',
  evidence: 'criterio_id',
};

/**
 * Transformar respuesta del backend al modelo del frontend
 */
export function mapBackendToFrontend(data: any, type: ElementType): StructureElement {
  const idField = ELEMENT_TYPE_TO_ID_FIELD[type];
  const parentField = ELEMENT_TYPE_TO_PARENT_FIELD[type];
  
  // Intentar obtener el ID del campo específico o del genérico "id"
  const elementId = data[idField] || data.id;

  return {
    id: String(elementId),
    nomenclature: data.nomenclatura || undefined,
    name: data.nombre || undefined,
    description: data.descripcion || undefined,
    type: type,
    parentElementId: parentField && data[parentField] ? String(data[parentField]) : undefined,
    active: data.activo !== undefined ? Boolean(data.activo) : true, // Default true si no viene
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    hasChildren: false, // TODO: Calcular basado en consultas adicionales
    canDelete: true,    // TODO: Verificar con lógica de negocio
  };
}

/**
 * Transformar datos del frontend al formato del backend
 * 
 * CASOS ESPECIALES:
 * - Estándar: NO tiene nomenclatura, solo descripcion
 * - Evidencia: necesita descripcion y nomenclatura
 */
export function mapFrontendToBackend(
  data: Partial<StructureElement>, 
  type: ElementType,
  _allElements?: StructureElement[]
): any {
  const parentField = ELEMENT_TYPE_TO_PARENT_FIELD[type];
  const payload: any = {};
  
  // **CASO ESPECIAL 1: ESTÁNDAR - Solo descripcion, SIN nomenclatura**
  if (type === 'standard') {
    payload.descripcion = data.description || data.name;
    if (data.parentElementId && parentField) {
      payload[parentField] = Number(data.parentElementId);
    }
    return payload;
  }
  
  // **CASO ESPECIAL 2: EVIDENCIA - descripcion y nomenclatura**
  if (type === 'evidence') {
    payload.descripcion = data.description || data.name;
    payload.nomenclatura = data.nomenclature;
    if (data.parentElementId && parentField) {
      payload[parentField] = Number(data.parentElementId);
    }
    return payload;
  }
  
  // **MAPEO NORMAL para otros tipos**
  if (data.name !== undefined) payload.nombre = data.name;
  if (data.nomenclature !== undefined) payload.nomenclatura = data.nomenclature;
  if (data.description !== undefined) payload.descripcion = data.description;
  
  // Mapeo del padre para todos los tipos
  if (data.parentElementId && parentField) {
    payload[parentField] = Number(data.parentElementId);
  }
  
  return payload;
}