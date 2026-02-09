/**
 * StructureService - Servicio para operaciones con la estructura del repositorio
 * Integración con backend Laravel siguiendo el patrón de servicios modernos
 * Maneja CRUD completo de todos los tipos de elementos
 */

import { axiosInstance } from '@/Config/axios';
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
    // Primero, obtener un usuario válido del sistema
    let userId = 5; // Valor por defecto

    try {
      const usersResponse = await axiosInstance.get('/admin/users');
      const usersData = usersResponse.data;
      
      // Usar el primer usuario disponible
      if (usersData && usersData.length > 0) {
        userId = usersData[0].usuario_id;
        console.log('✅ Usando usuario_id:', userId, 'para crear comentario');
      }
    } catch (error) {
      console.warn('No se pudo obtener usuarios, usando ID por defecto:', userId);
    }

    const response = await axiosInstance.post('/dev/comments', {
      usuario_id: userId,
      texto: 'Comentario generado automáticamente por el sistema'
    });

    return response.data.comentario_id;
  } catch (error: any) {
    console.error('Error creando comentario del sistema:', error);
    throw new Error(error.response?.data?.message || 'No se pudo crear el comentario requerido');
  }
}

/**
 * Obtener o crear un estado de evidencia por defecto
 * Necesario para crear evidencias
 */
async function ensureEvidenceState(): Promise<number> {
  try {
    // Intentar obtener estados existentes
    const response = await axiosInstance.get('/estructura/estados-evidencia');
    const data = response.data;
    const estados = Array.isArray(data) ? data : (data.data || []);
    
    if (estados.length > 0) {
      // Usar el primer estado disponible
      return estados[0].estado_evidencia_id;
    }

    // Si no existe ninguno, crear uno por defecto
    const createResponse = await axiosInstance.post('/estructura/estados-evidencia', {
      nombre: 'Pendiente'
    });

    return createResponse.data.estado_evidencia_id || createResponse.data.data?.estado_evidencia_id;
  } catch (error: any) {
    console.error('Error obteniendo/creando estado de evidencia:', error);
    throw new Error(error.response?.data?.message || 'No se pudo obtener un estado de evidencia válido');
  }
}

/**
 * Servicio para gestión de estructura
 */
class StructureService {
  /**
  * Listar todos los elementos de un tipo específico
  */
  async listByType(type: ElementType): Promise<ApiResponse<StructureElement[]>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const response = await axiosInstance.get(`/estructura/${endpoint}`);
      const data = response.data;
      
      let rawElements = Array.isArray(data) ? data : (data.data || []);
      
      const transformedElements = rawElements.map((item: any) => 
        mapBackendToFrontend(item, type)
      );

      return {
        message: 'Elementos cargados exitosamente',
        data: transformedElements
      };
    } catch (error: any) {
      console.error(`Error listando ${type}:`, error);
      throw new Error(error.response?.data?.message || error.message || `Error al listar ${type}`);
    }
  }

  /**
  * Obtener todos los elementos (árbol completo)
  */
  async getFullTree(): Promise<ApiResponse<StructureElement[]>> {
    try {
      const types: ElementType[] = [
        'university', 'campus', 'career',
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
      const response = await axiosInstance.get(`/estructura/${endpoint}/${id}`);
      const data = response.data;
      
      console.log(`📥 Backend response for ${type} ${id}:`, data);
      
      // El backend puede devolver { data: {...} } o directamente {...}
      const rawData = data.data || data;
      const transformedElement = mapBackendToFrontend(rawData, type);
      
      console.log(`✨ Transformed ${type}:`, transformedElement);
      
      return {
        message: data.message || 'Elemento obtenido exitosamente',
        data: transformedElement
      };
    } catch (error: any) {
      console.error(`Error obteniendo ${type} ${id}:`, error);
      throw new Error(error.response?.data?.message || error.message || `Error al obtener ${type}`);
    }
  }

  /**
   * Crear un nuevo elemento
   */
  async create(elementData: CreateElementForm, allElements?: StructureElement[]): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[elementData.type];
      let payload = mapFrontendToBackend(elementData, elementData.type, allElements);

      console.log('🔍 DEBUG CREATE:', {
        type: elementData.type,
        elementData: elementData,
        payload: payload
      });

      // **CASO ESPECIAL: Si es facultad y necesita fetch del campus**
      if (elementData.type === 'faculty' && payload._needsCampusFetch) {
        console.log('🔄 Haciendo fetch del campus para obtener universidad_id...');
        try {
          const campusResponse = await this.getById('campus', payload._campusId);
          console.log('📥 Respuesta completa del campus:', campusResponse);
          console.log('📥 Data del campus:', campusResponse.data);
          console.log('📥 ParentElementId del campus:', campusResponse.data?.parentElementId);
          
          if (campusResponse.data && campusResponse.data.parentElementId) {
            payload.universidad_id = Number(campusResponse.data.parentElementId);
            console.log('✅ universidad_id obtenido del fetch:', payload.universidad_id);
          } else {
            console.error('❌ No se pudo obtener universidad_id del campus');
            console.error('Campus data recibido:', campusResponse.data);
            throw new Error('No se pudo determinar la universidad del campus seleccionado');
          }
        } catch (error) {
          console.error('Error obteniendo información del campus:', error);
          throw new Error('Error al obtener información del campus. Verifica que el campus exista.');
        }
        // Limpiar flags temporales
        delete payload._needsCampusFetch;
        delete payload._campusId;
      }

      const requiresComment = ['dimension', 'component', 'criteria'].includes(elementData.type);
      
      if (requiresComment) {
        const comentarioId = await createSystemComment();
        payload.comentario_id = comentarioId;
      }

      if (elementData.type === 'evidence') {
        const estadoId = await ensureEvidenceState();
        payload.estado_evidencia_id = estadoId;
      }

      console.log('📤 PAYLOAD FINAL A ENVIAR:', payload);

      const response = await axiosInstance.post(`/estructura/${endpoint}`, payload);
      const data = response.data;

      console.log('🔍 Backend response data:', data);

      const responseData = data.data || data;
      console.log('🔍 Element data to transform:', responseData);

      if (responseData && typeof responseData === 'object') {
        const transformedElement = mapBackendToFrontend(responseData, elementData.type);
        console.log('🔍 Transformed element:', transformedElement);
        return {
          message: data.message || 'Elemento creado exitosamente',
          data: transformedElement
        };
      }

      throw new Error('No se recibieron datos válidos del servidor');
      
    } catch (error: any) {
      console.error('Error creando elemento:', error);
      console.error('🔥 ERROR COMPLETO DEL BACKEND:', error.response?.data);
      throw new Error(error.response?.data?.errorMessage || error.response?.data?.message || error.message || 'Error al crear elemento');
    }
  }

  /**
  * Actualizar un elemento existente
  */
  async update(type: ElementType, id: string, elementData: EditElementForm): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      let payload: any;
      
      const requiresSpecialHandling = ['faculty', 'campus', 'dimension', 'component', 'criteria', 'career', 'standard'].includes(type);

      if (requiresSpecialHandling) {
        const currentResponse = await axiosInstance.get(`/estructura/${endpoint}/${id}`);
        const currentData = currentResponse.data;
        const current = currentData.data || currentData;
        
        console.log(`🔍 Current ${type} data from backend:`, current);
        
        payload = {
          nombre: elementData.name,
          nomenclatura: elementData.nomenclature,
          descripcion: elementData.description
        };
        
        if (type === 'faculty') {
          payload.sede_id = current.sede_id;
          payload.universidad_id = current.universidad_id;
        } else if (type === 'campus') {
          payload.universidad_id = current.universidad_id;
        } else if (['dimension', 'component', 'criteria'].includes(type)) {
          payload.comentario_id = current.comentario_id;
        } else if (type === 'career') {
          payload.facultad_id = current.facultad_id;
        } else if (type === 'standard') {
          payload.criterio_id = current.criterio_id;
        }
      } else {
        payload = mapFrontendToBackend(elementData, type);
      }

      console.log('🔍 DEBUG UPDATE:', {
        type: type,
        id: id,
        elementData: elementData,
        payload: payload
      });

      const response = await axiosInstance.put(`/estructura/${endpoint}/${id}`, payload);
      const data = response.data;

      // Lógica mejorada: buscar el objeto de datos tanto en data.data como en data directamente.
      const responseData = data.data || data;

      // Verificar que tenemos un objeto de datos válido antes de transformar
      if (responseData && typeof responseData === 'object' && Object.keys(responseData).length > 0) {
          const transformedElement = mapBackendToFrontend(responseData, type);
          return {
              message: data.message || 'Elemento actualizado exitosamente',
              data: transformedElement
          };
      }

      // Si no se encuentran datos válidos, puede que la respuesta sea simple (ej. solo un mensaje)
      return data;
    } catch (error: any) {
      console.error(`Error actualizando ${type} ${id}:`, error);
      throw new Error(error.response?.data?.message || error.message || `Error al actualizar ${type}`);
    }
  }

  /**
   * Eliminar un elemento
   */
  async delete(type: ElementType, id: string): Promise<ApiResponse<null>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      await axiosInstance.delete(`/estructura/${endpoint}/${id}`);

      // 204 No Content no tiene body, así que devolvemos un objeto vacío
      return {
        message: 'Elemento eliminado exitosamente',
        data: null
      };
    } catch (error: any) {
      console.error(`Error eliminando ${type} ${id}:`, error);
      throw new Error(error.response?.data?.message || error.message || `Error al eliminar ${type}`);
    }
  }

  /**
   * Activar/Desactivar un elemento
   */
  async setActive(type: ElementType, id: string, active: boolean): Promise<ApiResponse<StructureElement>> {
    try {
      const endpoint = ELEMENT_TYPE_TO_ENDPOINT[type];
      const payload = { active };
      
      console.log('🔥 setActive REQUEST:', { endpoint, id, payload });
      
      const response = await axiosInstance.patch(`/estructura/${endpoint}/${id}/active`, payload);
      const data = response.data;

      console.log('🔥 setActive RESPONSE status:', response.status);
      console.log('🔥 setActive SUCCESS data:', data);
      
      if (data.data) {
        const transformedElement = mapBackendToFrontend(data.data, type);
        return {
          ...data,
          data: transformedElement
        };
      }

      return data;
    } catch (error: any) {
      console.error(`Error cambiando estado de ${type} ${id}:`, error);
      console.log('🔥 setActive ERROR data:', error.response?.data);
      throw new Error(error.response?.data?.message || error.response?.data?.errorMessage || error.message || `Error al cambiar estado de ${type}`);
    }
  }
}

// Instancia singleton del servicio
export const structureService = new StructureService();
