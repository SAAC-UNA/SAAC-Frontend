/**
 * Hook personalizado para gestión de notificaciones
 * HU-018 - Notificaciones automáticas
 * 
 * Features:
 * - Polling automático cada 30 segundos
 * - Estado centralizado de notificaciones
 * - Contador de no leídas
 * - Funciones para marcar como leída y eliminar
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationService } from '@/Services/NotificationService';
import type { Notification, NotificationFilters } from '@/Types/NotificationTypes';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificacionId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificacionId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

interface UseNotificationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number; // en milisegundos
  autoFetch?: boolean;
}

export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsReturn => {
  const {
    enablePolling = true,
    pollingInterval = 30000, // 30 segundos por defecto
    autoFetch = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Obtener notificaciones con filtros opcionales
   */
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await NotificationService.getAll(filters);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notificaciones');
      console.error('Error en fetchNotifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener contador de no leídas
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error en fetchUnreadCount:', err);
      // No mostramos error al usuario para el contador
    }
  }, []);

  /**
   * Marcar una notificación como leída
   */
  const markAsRead = useCallback(async (notificacionId: number) => {
    try {
      await NotificationService.markAsRead(notificacionId);
      
      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificacion_id === notificacionId
            ? { ...notif, leida: true, fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
      
      // Actualizar contador
      await fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Error al marcar como leída');
      throw err;
    }
  }, [fetchUnreadCount]);

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Actualizar estado local
      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          leida: true,
          fecha_lectura: now,
        }))
      );
      
      // Resetear contador
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Error al marcar todas como leídas');
      throw err;
    }
  }, []);

  /**
   * Eliminar una notificación
   */
  const deleteNotification = useCallback(async (notificacionId: number) => {
    try {
      await NotificationService.delete(notificacionId);
      
      // Remover del estado local
      setNotifications(prev =>
        prev.filter(notif => notif.notificacion_id !== notificacionId)
      );
      
      // Actualizar contador si era no leída
      const deletedNotification = notifications.find(n => n.notificacion_id === notificacionId);
      if (deletedNotification && !deletedNotification.leida) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar notificación');
      throw err;
    }
  }, [notifications]);

  /**
   * Refrescar notificaciones y contador
   */
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  /**
   * Inicializar: cargar notificaciones y contador
   */
  useEffect(() => {
    if (autoFetch) {
      refreshNotifications();
    }
  }, [autoFetch, refreshNotifications]);

  /**
   * Configurar polling automático
   */
  useEffect(() => {
    if (enablePolling) {
      // Polling solo para el contador (más ligero)
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [enablePolling, pollingInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};
