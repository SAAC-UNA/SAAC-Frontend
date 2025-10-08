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
      
      if (data.data) {
        const transformedElement = mapBackendToFrontend(data.data, elementData.type);
        return {
          ...data,
          data: transformedElement
        };
      }

      return data;
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