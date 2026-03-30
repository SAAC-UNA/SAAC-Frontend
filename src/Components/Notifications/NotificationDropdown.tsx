/**
 * NotificationDropdown - Dropdown de notificaciones recientes
 * HU-018 - Notificaciones automáticas
 *
 * Se muestra al hacer click en NotificationBell
 * Muestra las últimas 5 notificaciones
 */

import React, { useEffect, useState } from "react";
import { Button, LoadingSpinner } from "@/Components/Ui/Index";
import { NotificationCard } from "./NotificationCard";
import { useNotifications } from "@/Hooks/useNotifications";
import { NotificationService } from "@/Services/NotificationService";
import type { Notification } from "@/Types/NotificationTypes";

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onViewAll,
}) => {
  const [notifData, setNotifData] = useState<{
    notifications: Notification[];
    loading: boolean;
  }>({ notifications: [], loading: true });

  const { markAsRead, markAllAsRead, unreadCount } = useNotifications({
    enablePolling: false,
    autoFetch: false,
  });

  // Cargar últimas 6 notificaciones
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const recent = await NotificationService.getRecent(6);
        setNotifData({ notifications: recent, loading: false });
      } catch (error) {
        console.error("Error cargando notificaciones recientes:", error);
        setNotifData((prev) => ({ ...prev, loading: false }));
      }
    };

    loadRecent();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.notificacion_id === id
          ? { ...n, leida: true, fecha_lectura: new Date().toISOString() }
          : n,
      ),
    }));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({
        ...n,
        leida: true,
        fecha_lectura: new Date().toISOString(),
      })),
    }));
  };

  const handleViewAll = () => {
    onClose();
    onViewAll();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 relative flex items-center justify-center">
        <h3 className="text-sm font-semibold text-gray-900 text-center">
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
            className="absolute right-4 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Marcar todas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="overflow-y-auto flex-1">
        {notifData.loading ? (
          <div className="relative py-4 min-h-[200px]">
            <LoadingSpinner variant="loader" />
          </div>
        ) : notifData.notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p className="text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {notifData.notifications.map((notification) => (
              <NotificationCard
                key={notification.notificacion_id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                compact={true}
                onNavigate={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Siempre visible */}
      <div className="px-4 py-3 border-t border-gray-200 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="w-auto px-4 text-xs text-gris-una hover:text-negro-una"
        >
          Ver todas las notificaciones
        </Button>
      </div>
    </div>
  );
};
