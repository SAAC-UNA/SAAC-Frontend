/**
 * StructureService - Servicio para operaciones con la estructura del repositorio
 * 
 * Integración con backend Laravel siguiendo el patrón de RoleService
 * Maneja CRUD completo de todos los tipos de elementos
 */

import type { ElementType, StructureElement, CreateElementForm, EditElementForm } from '@/Types/StructureTypes';
import { 
  ELEMENT_TYPE_TO_ENDPOINT,
  mapBackendToFrontend,
  mapFrontendToBackend 
} from '@/Utils/StructureMapper';

/**
 * Estructura estándar de respuesta de la API Laravel
 */
export interface ApiResponse<T = any> {
  message?: string;
  errorMessage?: string;
  data?: T;
}

/**
 * Crear comentario de sistema (necesario para dimensiones, componentes y criterios)
 * Usa el endpoint de desarrollo /api/dev/comments
 */
async function createSystemComment(): Promise<number> {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/dev/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: 1, // Usuario del sistema (debe existir en BD)
        texto: 'Comentario generado automáticamente por el sistema'
      }),
    });

    if (!response.ok) {
      throw new Error(`Error creando comentario: ${response.status}`);
    }

    const data = await response.json();
    return data.comentario_id;
  } catch (error) {
    console.error('Error creando comentario del sistema:', error);
    throw new Error('No se pudo crear el comentario requerido');
  }
}

/**
 * Obtener o crear un estado de evidencia por defecto
 * Necesario para crear evidencias
 */
async function ensureEvidenceState(): Promise<number> {
  try {
    // Intentar obtener estados existentes
    const response = await fetch('http://127.0.0.1:8000/api/estructura/estados-evidencia', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const estados = Array.isArray(data) ? data : (data.data || []);
      
      if (estados.length > 0) {
        // Usar el primer estado disponible
        return estados[0].estado_evidencia_id;
      }
    }

    // Si no existe ninguno, crear uno por defecto
    const createResponse = await fetch('http://127.0.0.1:8000/api/estructura/estados-evidencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Pendiente'
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Error creando estado de evidencia: ${createResponse.status}`);
    }

    const newState = await createResponse.json();
    return newState.estado_evidencia_id || newState.data?.estado_evidencia_id;
    
  } catch (error) {
    console.error('Error obteniendo/creando estado de evidencia:', error);
    throw new Error('No se pudo obtener un estado de evidencia válido');
  }
}

/**
 * Servicio para gestión de estructura - Patrón Singleton
 */
class StructureService {
  private baseURL: string;

  constructor() {
    // URL base del backend Laravel - igual que RoleService
    this.baseURL = 'http://127.0.0.1:8000/api/estructura';
  }

  /**
 * Listar todos los elementos de un tipo específico
 */
async listByType(type: ElementType): Promise<ApiResponse<StructureElement[]>> {
  try {
    const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // El backend puede devolver directamente un array o un objeto {data: [...]}
    let rawElements = Array.isArray(data) ? data : (data.data || []);
    
    // Transformar cada elemento del backend al formato frontend
    const transformedElements = rawElements.map((item: any) => 
      mapBackendToFrontend(item, type)
    );

    return {
      message: 'Elementos cargados exitosamente',
      data: transformedElements
    };
  } catch (error) {
    console.error(`Error listando ${type}:`, error);
    throw error;
  }
}

  /**
 * Obtener todos los elementos (árbol completo)
 */
async getFullTree(): Promise<ApiResponse<StructureElement[]>> {
  try {
    const types: ElementType[] = [
      'university', 'campus', 'faculty', 'career',
      'dimension', 'component', 'criteria', 'standard', 'evidence'
    ];

    const results = await Promise.allSettled(
      types.map(async (type) => {
        try {
          const result = await this.listByType(type);
          return result.data || [];
        } catch (error) {
          console.warn(`Error cargando ${type}, devolviendo array vacío:`, error);
          return [];
        }
      })
    );

    // Extraer solo los resultados exitosos y aplanar
    const allElements = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => (result as PromiseFulfilledResult<StructureElement[]>).value);

    return {
      message: 'Estructura cargada exitosamente',
      data: allElements
    };
  } catch (error) {
    console.error('Error en getFullTree:', error);
    throw error;
  }
}

  /**
   * Obtener un elemento específico por ID y tipo
   */
  async getById(type: ElementType, id: string): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data) {
        const transformedElement = mapBackendToFrontend(data.data, type);
        return {
          ...data,
          data: transformedElement
        };
      }

      return data;
    } catch (error) {
      console.error(`Error obteniendo ${type} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo elemento
   */
  async create(elementData: CreateElementForm, allElements?: StructureElement[]): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[elementData.type];
      // Pasar allElements al mapper para el caso especial de Facultad
      const payload = mapFrontendToBackend(elementData, elementData.type, allElements);

      console.log('🔍 DEBUG CREATE:', {
      type: elementData.type,
      elementData: elementData,
      payload: payload
    });

      // Si es dimensión, componente o criterio, crear comentario primero
      const requiresComment = ['dimension', 'component', 'criteria'].includes(elementData.type);
    
      if (requiresComment) {
        const comentarioId = await createSystemComment();
        payload.comentario_id = comentarioId;
      }

      //  Si es evidencia, necesita estado_evidencia_id
      if (elementData.type === 'evidence') {
        const estadoId = await ensureEvidenceState();
        payload.estado_evidencia_id = estadoId;
      }

      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Backend response data:', data);

      // Determinar si el backend devolvió {data: {...}} o directamente {...}
      const responseData = data.data || data;
      console.log('🔍 Element data to transform:', responseData);

      // Verificar que tenemos datos válidos
      if (responseData && typeof responseData === 'object') {
        const transformedElement = mapBackendToFrontend(responseData, elementData.type);
        console.log('🔍 Transformed element:', transformedElement);
        return {
          message: data.message || 'Elemento creado exitosamente',
          data: transformedElement
        };
      }

      // Si no hay datos válidos, lanzar error
      throw new Error('No se recibieron datos válidos del servidor');
      
    } catch (error) {
      console.error('Error creando elemento:', error);
      throw error;
    }
  }

  /**
   * Actualizar un elemento existente
   */
  async update(type: ElementType, id: string, elementData: EditElementForm): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const payload = mapFrontendToBackend(elementData, type);

      const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data) {
        const transformedElement = mapBackendToFrontend(data.data, type);
        return {
          ...data,
          data: transformedElement
        };
      }

      return data;
    } catch (error) {
      console.error(`Error actualizando ${type} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un elemento
   */
  async delete(type: ElementType, id: string): Promise<ApiResponse<null>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error eliminando ${type} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar un elemento
   */
  async setActive(type: ElementType, id: string, active: boolean): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const response = await fetch(`${this.baseURL}/${endpoint}/${id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data) {
        const transformedElement = mapBackendToFrontend(data.data, type);
        return {
          ...data,
          data: transformedElement
        };
      }

      return data;
    } catch (error) {
      console.error(`Error cambiando estado de ${type} ${id}:`, error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const structureService = new StructureService();