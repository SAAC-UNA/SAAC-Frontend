/**
 * NotificationDropdown - Dropdown de notificaciones recientes
 * HU-018 - Notificaciones automáticas
 * 
 * Se muestra al hacer click en NotificationBell
 * Muestra las últimas 5 notificaciones
 */

import React, { useEffect, useState } from 'react';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { NotificationCard } from './NotificationCard';
import { useNotifications } from '@/Hooks/useNotifications';
import { NotificationService } from '@/Services/NotificationService';
import type { Notification } from '@/Types/NotificationTypes';

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onViewAll,
}) => {
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { markAsRead, markAllAsRead, unreadCount } = useNotifications({
    enablePolling: false,
    autoFetch: false,
  });

  // Cargar últimas 6 notificaciones
  useEffect(() => {
    const loadRecent = async () => {
      try {
        setIsLoading(true);
        const recent = await NotificationService.getRecent(6);
        setRecentNotifications(recent);
      } catch (error) {
        console.error('Error cargando notificaciones recientes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecent();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    // Actualizar lista local
    setRecentNotifications(prev =>
      prev.map(n =>
        n.notificacion_id === id
          ? { ...n, leida: true, fecha_lectura: new Date().toISOString() }
          : n
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Actualizar lista local
    setRecentNotifications(prev =>
      prev.map(n => ({
        ...n,
        leida: true,
        fecha_lectura: new Date().toISOString(),
      }))
    );
  };

  const handleViewAll = () => {
    onClose();
    onViewAll();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Notificaciones
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Marcar todas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p className="text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {recentNotifications.map((notification) => (
              <NotificationCard
                key={notification.notificacion_id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Siempre visible */}
      <div className="px-4 py-3 border-t border-gray-200">
        <Button
          variant="transparent"
          size="sm"
          onClick={handleViewAll}
          className="w-full justify-center"
        >
          Ver todas las notificaciones
        </Button>
      </div>
    </div>
  );
};
