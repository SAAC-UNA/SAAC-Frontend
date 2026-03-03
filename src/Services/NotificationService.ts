/**
 * Servicio de Notificaciones
 * HU-018 - Notificaciones automáticas
 * 
 * Maneja todas las interacciones con el backend de notificaciones
 */

import { axiosInstance } from '@/Config/axios';
import type { 
  Notification, 
  NotificationFilters, 
  NotificationResponse,
  UnreadCountResponse 
} from '@/Types/NotificationTypes';

const BASE_URL = '/notificaciones';

export const NotificationService = {
  /**
   * Obtener todas las notificaciones del usuario autenticado
   * GET /api/notificaciones?leida=false&tipo_evento=asignacion_evidencia
   */
  getAll: async (filters?: NotificationFilters): Promise<Notification[]> => {
    try {
      const response = await axiosInstance.get<NotificationResponse>(BASE_URL, {
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener contador de notificaciones no leídas
   * GET /api/notificaciones/no-leidas/contador
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get<UnreadCountResponse>(
        `${BASE_URL}/no-leidas/contador`
      );
      return response.data.data.contador_no_leidas;
    } catch (error) {
      console.error('Error obteniendo contador de no leídas:', error);
      throw error;
    }
  },

  /**
   * Marcar una notificación como leída
   * POST /api/notificaciones/{id}/marcar-leida
   */
  markAsRead: async (notificacionId: number): Promise<void> => {
    try {
      await axiosInstance.post(`${BASE_URL}/${notificacionId}/marcar-leida`);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   * POST /api/notificaciones/marcar-todas-leidas
   */
  markAllAsRead: async (): Promise<number> => {
    try {
      const response = await axiosInstance.post<{
        message: string;
        data: { cantidad_actualizada: number };
      }>(`${BASE_URL}/marcar-todas-leidas`);
      return response.data.data.cantidad_actualizada;
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      throw error;
    }
  },

  /**
   * Eliminar una notificación
   * DELETE /api/notificaciones/{id}
   */
  delete: async (notificacionId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${notificacionId}`);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  },

  /**
   * Obtener solo las no leídas (helper)
   */
  getUnread: async (): Promise<Notification[]> => {
    return NotificationService.getAll({ leida: false });
  },

  /**
   * Obtener las más recientes (últimas N)
   */
  getRecent: async (limit: number = 5): Promise<Notification[]> => {
    const all = await NotificationService.getAll();
    return all.slice(0, limit);
  },
};
