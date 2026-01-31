/**
 * ExtensionRequestService - Servicio para operaciones con solicitudes de ampliación (HU-016)
 * Integración con backend Laravel endpoints de ExtensionRequestController
 */

import { axiosInstance } from '@/Config/axios';
import type {
  ExtensionRequest,
  CreateExtensionRequestData,
  ReviewExtensionRequestData,
  ExtensionRequestApiResponse,
  ExtensionRequestPaginatedResponse,
  ExtensionRequestFilters
} from '@/Types/ExtensionRequestTypes';
import { devLog } from '@/Utils/devLogger';

class ExtensionRequestService {
  private readonly BASE_PATH = '/solicitudes-ampliacion';

  /**
   * Crear nueva solicitud de ampliación
   * POST /api/solicitudes-ampliacion
   */
  async createRequest(data: CreateExtensionRequestData): Promise<ExtensionRequest> {
    try {
      devLog.info('ExtensionRequestService - Creando solicitud de ampliación');
      console.log('📤 Datos a enviar:', data);
      
      const response = await axiosInstance.post<ExtensionRequestApiResponse>(
        this.BASE_PATH,
        data
      );

      devLog.info('ExtensionRequestService - Solicitud creada exitosamente');
      return response.data.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al crear solicitud', error);
      console.error('❌ Respuesta del servidor:', error.response?.data);
      
      // Mostrar errores de validación si existen
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        console.error('❌ Errores de validación:', validationErrors);
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Error al crear la solicitud de ampliación'
      );
    }
  }

  /**
   * Obtener mis solicitudes (del usuario autenticado)
   * GET /api/solicitudes-ampliacion/mis-solicitudes
   */
  async getMyRequests(filters?: ExtensionRequestFilters): Promise<ExtensionRequestPaginatedResponse> {
    try {
      devLog.info('ExtensionRequestService - Obteniendo mis solicitudes');
      
      const response = await axiosInstance.get<ExtensionRequestPaginatedResponse>(
        `${this.BASE_PATH}/mis-solicitudes`,
        { params: filters }
      );

      devLog.info('ExtensionRequestService - Mis solicitudes obtenidas');
      return response.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al obtener mis solicitudes', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener las solicitudes'
      );
    }
  }

  /**
   * Obtener solicitudes pendientes (solo encargados)
   * GET /api/solicitudes-ampliacion/pendientes
   */
  async getPendingRequests(filters?: ExtensionRequestFilters): Promise<ExtensionRequestPaginatedResponse> {
    try {
      devLog.info('ExtensionRequestService - Obteniendo solicitudes pendientes');
      
      const response = await axiosInstance.get<ExtensionRequestPaginatedResponse>(
        `${this.BASE_PATH}/pendientes`,
        { params: filters }
      );

      devLog.info('ExtensionRequestService - Solicitudes pendientes obtenidas');
      return response.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al obtener solicitudes pendientes', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener las solicitudes pendientes'
      );
    }
  }

  /**
   * Obtener todas las solicitudes (solo encargados)
   * GET /api/solicitudes-ampliacion
   */
  async getAllRequests(filters?: ExtensionRequestFilters): Promise<ExtensionRequestPaginatedResponse> {
    try {
      devLog.info('ExtensionRequestService - Obteniendo todas las solicitudes');
      
      const response = await axiosInstance.get<ExtensionRequestPaginatedResponse>(
        this.BASE_PATH,
        { params: filters }
      );

      devLog.info('ExtensionRequestService - Todas las solicitudes obtenidas');
      return response.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al obtener todas las solicitudes', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener las solicitudes'
      );
    }
  }

  /**
   * Obtener detalle de una solicitud
   * GET /api/solicitudes-ampliacion/{id}
   */
  async getRequestById(id: number): Promise<ExtensionRequest> {
    try {
      devLog.info(`ExtensionRequestService - Obteniendo detalle de solicitud ${id}`);
      
      const response = await axiosInstance.get<{ data: ExtensionRequest }>(
        `${this.BASE_PATH}/${id}`
      );

      devLog.info('ExtensionRequestService - Detalle de solicitud obtenido');
      return response.data.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al obtener detalle de solicitud', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener el detalle de la solicitud'
      );
    }
  }

  /**
   * Aprobar una solicitud (solo encargados)
   * POST /api/solicitudes-ampliacion/{id}/aprobar
   */
  async approveRequest(
    id: number, 
    data?: ReviewExtensionRequestData
  ): Promise<ExtensionRequest> {
    try {
      devLog.info(`ExtensionRequestService - Aprobando solicitud ${id}`);
      
      const response = await axiosInstance.post<ExtensionRequestApiResponse>(
        `${this.BASE_PATH}/${id}/aprobar`,
        data || {}
      );

      devLog.info('ExtensionRequestService - Solicitud aprobada exitosamente');
      return response.data.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al aprobar solicitud', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Error al aprobar la solicitud'
      );
    }
  }

  /**
   * Rechazar una solicitud (solo encargados)
   * POST /api/solicitudes-ampliacion/{id}/rechazar
   */
  async rejectRequest(
    id: number, 
    data: ReviewExtensionRequestData
  ): Promise<ExtensionRequest> {
    try {
      devLog.info(`ExtensionRequestService - Rechazando solicitud ${id}`);
      
      const response = await axiosInstance.post<ExtensionRequestApiResponse>(
        `${this.BASE_PATH}/${id}/rechazar`,
        data
      );

      devLog.info('ExtensionRequestService - Solicitud rechazada exitosamente');
      return response.data.data;
    } catch (error: any) {
      devLog.error('ExtensionRequestService - Error al rechazar solicitud', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Error al rechazar la solicitud'
      );
    }
  }
}

// Exportar instancia única del servicio
export const extensionRequestService = new ExtensionRequestService();
export default extensionRequestService;
