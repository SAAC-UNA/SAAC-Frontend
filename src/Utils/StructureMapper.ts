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
  faculty: 'facultades',
  career: 'carreras',
  dimension: 'dimensiones',
  component: 'componentes',
  criteria: 'criterios',
  standard: 'estandares',
  evidence: 'evidencias',
};

// Mapeo de tipos a nombres de ID en el backend
export const ELEMENT_TYPE_TO_ID_FIELD: Record<ElementType, string> = {
  university: 'universidad_id',
  campus: 'sede_id',
  faculty: 'facultad_id',
  career: 'carrera_id',
  dimension: 'dimension_id',
  component: 'componente_id',
  criteria: 'criterio_id',
  standard: 'estandar_id',
  evidence: 'evidencia_id',
};

// Mapeo de tipos a campo del padre
export const ELEMENT_TYPE_TO_PARENT_FIELD: Record<ElementType, string | null> = {
  university: null,
  campus: 'universidad_id',
  faculty: 'sede_id',
  career: 'facultad_id',
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
  
  return {
    id: String(data[idField]),
    nomenclature: data.nomenclatura || undefined,
    name: data.nombre || undefined,
    description: data.descripcion || undefined,
    type: type,
    parentElementId: parentField && data[parentField] ? String(data[parentField]) : undefined,
    active: data.activo !== undefined ? Boolean(data.activo) : true, // Default true si no viene
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    hasChildren: false, // TODO: Calcular basado en consultas adicionales
    canDelete: true,    // TODO: Verificar con lógica de negocio
  };
}

/**
 * Transformar datos del frontend al formato del backend
 * 
 * CASO ESPECIAL: Facultad necesita sede_id Y universidad_id
 * Para obtener universidad_id, necesitamos buscar el campus padre
 */
export function mapFrontendToBackend(
  data: Partial<StructureElement>, 
  type: ElementType,
  allElements?: StructureElement[]
): any {
  const parentField = ELEMENT_TYPE_TO_PARENT_FIELD[type];
  
  const payload: any = {};
  
  if (data.name !== undefined) payload.nombre = data.name;
  if (data.nomenclature !== undefined) payload.nomenclatura = data.nomenclature;
  if (data.description !== undefined) payload.descripcion = data.description;
  
  // **CASO ESPECIAL: FACULTAD requiere 2 padres**
  if (type === 'faculty' && data.parentElementId) {
    // El padre directo es el Campus (Sede)
    payload.sede_id = Number(data.parentElementId);
    
    // Necesitamos obtener universidad_id del campus padre
    if (allElements) {
      const campus = allElements.find(el => el.id === data.parentElementId);
      if (campus && campus.parentElementId) {
        payload.universidad_id = Number(campus.parentElementId);
      } else {
        console.warn('No se pudo obtener universidad_id del campus padre');
      }
    } else {
      console.warn('Se necesita allElements para crear una Facultad correctamente');
    }
  } else {
    // Para otros tipos, mapeo normal del padre
    if (data.parentElementId && parentField) {
      payload[parentField] = Number(data.parentElementId);
    }
  }
  
  return payload;
}