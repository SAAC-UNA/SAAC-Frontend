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
 * - Facultad: necesita sede_id Y universidad_id (tanto para crear como actualizar)
 * - Estándar: NO tiene nomenclatura, solo descripcion
 * - Evidencia: necesita descripcion y nomenclatura
 * 
 * NOTA: Para facultades, si no se puede determinar universidad_id desde allElements,
 * se debe hacer una petición separada al backend para obtener el campus completo.
 */
export function mapFrontendToBackend(
  data: Partial<StructureElement>, 
  type: ElementType,
  allElements?: StructureElement[]
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
  
  // **CASO ESPECIAL 3: FACULTAD requiere 2 padres siempre**
  if (type === 'faculty') {
    console.log('🏫 CREANDO FACULTAD - Debug:', {
      parentElementId: data.parentElementId,
      hasAllElements: !!allElements,
      allElementsLength: allElements?.length || 0,
      dataCompleto: data
    });
    
    if (data.parentElementId) {
      // Crear: Tiene parentElementId nuevo (que es el sede_id)
      payload.sede_id = Number(data.parentElementId);
      console.log('✅ Asignado sede_id:', payload.sede_id);
      
      // OPCIÓN 1: Buscar en allElements (árbol)
      if (allElements && allElements.length > 0) {
        // Función auxiliar para buscar en árbol jerárquico
        const findInTree = (elements: StructureElement[], id: string): StructureElement | undefined => {
          for (const el of elements) {
            if (el.id === id) return el;
            if (el.childElements && el.childElements.length > 0) {
              const found = findInTree(el.childElements, id);
              if (found) return found;
            }
          }
          return undefined;
        };
        
        const campus = findInTree(allElements, data.parentElementId);
        console.log('🔍 Campus encontrado en árbol:', campus);
        
        if (campus && campus.parentElementId) {
          payload.universidad_id = Number(campus.parentElementId);
          console.log('✅ universidad_id obtenido del árbol:', payload.universidad_id);
        } else if (campus && campus.type === 'campus') {
          // Si encontramos el campus pero no tiene parentElementId visible,
          // intentar buscarlo en la lista plana
          console.warn('⚠️ Campus encontrado pero sin parentElementId en el árbol');
        }
      }
      
      // OPCIÓN 2: Si no se encontró, marcar para que el service haga fetch
      if (!payload.universidad_id) {
        console.error('❌ No se pudo determinar universidad_id desde allElements');
        console.error('Se necesitará hacer fetch del campus para obtener universidad_id');
        // Marcamos el payload con un flag especial
        payload._needsCampusFetch = true;
        payload._campusId = data.parentElementId;
      }
    } else if (allElements && allElements.length > 0) {
      // Actualizar: Usar los padres del elemento actual
      const currentElement = allElements[0]; // El elemento actual que pasamos
      if (currentElement.parentElementId) {
        payload.sede_id = Number(currentElement.parentElementId);
        // Buscar la universidad desde el campus
        // Nota: Aquí necesitaríamos todos los elementos para buscar el campus padre
        // Por simplicidad, asumimos que el backend mantiene la universidad
        console.warn('Al actualizar facultad, no se puede determinar universidad_id sin más contexto');
      }
    }
  } else {
    // Para otros tipos, mapeo normal del padre
    if (data.parentElementId && parentField) {
      payload[parentField] = Number(data.parentElementId);
    }
  }
  
  return payload;
}