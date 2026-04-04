/**
 * FlexibleExtensionRequestService - Servicio para solicitudes de ampliación del modelo flexible (HU-016)
 * Integración con backend FlexibleExtensionRequestController
 * Endpoints: /api/elemento-solicitudes-ampliacion
 */

import { axiosInstance } from '@/Config/axios';
import type {
  ExtensionRequest,
  ReviewExtensionRequestData,
  ExtensionRequestApiResponse,
  ExtensionRequestPaginatedResponse,
  ExtensionRequestFilters,
} from '@/Types/ExtensionRequestTypes';
import { devLog } from '@/Utils/devLogger';

class FlexibleExtensionRequestService {
  private readonly BASE_PATH = '/elemento-solicitudes-ampliacion';

  /**
   * Obtener solicitudes pendientes (solo encargados)
   * GET /api/elemento-solicitudes-ampliacion/pendientes
   */
  async getPendingRequests(filters?: ExtensionRequestFilters): Promise<ExtensionRequestPaginatedResponse> {
    try {
      const response = await axiosInstance.get<ExtensionRequestPaginatedResponse>(
        `${this.BASE_PATH}/pendientes`,
        { params: filters },
      );
      return response.data;
    } catch (error: any) {
      devLog.error('FlexibleExtensionRequestService - Error al obtener solicitudes pendientes', error);
      throw new Error(
        error.response?.data?.message ?? 'Error al obtener las solicitudes pendientes',
      );
    }
  }

  /**
   * Obtener todas las solicitudes (solo encargados)
   * GET /api/elemento-solicitudes-ampliacion
   */
  async getAllRequests(filters?: ExtensionRequestFilters): Promise<ExtensionRequestPaginatedResponse> {
    try {
      const response = await axiosInstance.get<ExtensionRequestPaginatedResponse>(
        this.BASE_PATH,
        { params: filters },
      );
      return response.data;
    } catch (error: any) {
      devLog.error('FlexibleExtensionRequestService - Error al obtener solicitudes', error);
      throw new Error(
        error.response?.data?.message ?? 'Error al obtener las solicitudes',
      );
    }
  }

  /**
   * Aprobar una solicitud (solo encargados)
   * POST /api/elemento-solicitudes-ampliacion/{id}/aprobar
   */
  async approveRequest(id: number, data?: ReviewExtensionRequestData): Promise<ExtensionRequest> {
    try {
      const response = await axiosInstance.post<ExtensionRequestApiResponse>(
        `${this.BASE_PATH}/${id}/aprobar`,
        data ?? {},
      );
      return response.data.data;
    } catch (error: any) {
      devLog.error('FlexibleExtensionRequestService - Error al aprobar', error);
      throw new Error(
        error.response?.data?.message ?? error.response?.data?.error ?? 'Error al aprobar la solicitud',
      );
    }
  }

  /**
   * Rechazar una solicitud (solo encargados)
   * POST /api/elemento-solicitudes-ampliacion/{id}/rechazar
   */
  async rejectRequest(id: number, data: ReviewExtensionRequestData): Promise<ExtensionRequest> {
    try {
      const response = await axiosInstance.post<ExtensionRequestApiResponse>(
        `${this.BASE_PATH}/${id}/rechazar`,
        data,
      );
      return response.data.data;
    } catch (error: any) {
      devLog.error('FlexibleExtensionRequestService - Error al rechazar', error);
      throw new Error(
        error.response?.data?.message ?? error.response?.data?.error ?? 'Error al rechazar la solicitud',
      );
    }
  }
}

export const flexibleExtensionRequestService = new FlexibleExtensionRequestService();
