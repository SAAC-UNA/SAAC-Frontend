/**
 * NotificationCenterModal - Modal de centro de notificaciones
 * HU-018 - Notificaciones automáticas
 * 
 * Modal donde el usuario puede:
 * - Ver todas sus notificaciones
 * - Filtrar por tipo y estado
 * - Marcar como leídas
 * - Eliminar notificaciones
 */

import React, { useMemo, useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button, LoadingSpinner } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { NotificationCard } from '@/Components/Notifications/NotificationCard';
import { NotificationFiltersComponent } from '@/Components/Notifications/NotificationFilters';
import { useNotifications } from '@/Hooks/useNotifications';
import type { NotificationFilters } from '@/Types/NotificationTypes';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications({
    enablePolling: true,
    autoFetch: true,
  });

  const [currentFilters, setCurrentFilters] = useState<NotificationFilters>({});
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, typeof notifications>();

    const getLabel = (dateString: string) => {
      const date = new Date(dateString);
      if (isToday(date)) return 'Hoy';
      if (isYesterday(date)) return 'Ayer';
      return format(date, 'dd MMM yyyy', { locale: es });
    };

    notifications.forEach((notification) => {
      const label = getLabel(notification.created_at);
      const list = groups.get(label) || [];
      list.push(notification);
      groups.set(label, list);
    });

    return Array.from(groups.entries());
  }, [notifications]);

  // Aplicar filtros
  const handleFilterChange = (filters: NotificationFilters) => {
    setCurrentFilters(filters);
    fetchNotifications(filters);
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllAsRead();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Marcar una como leída
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  // Eliminar notificación
  const handleDelete = async (id: number) => {
    const confirmed = confirm('¿Está seguro que desea eliminar esta notificación?');
    if (!confirmed) return;

    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Notificaciones"
      size="xl"
      className="min-h-[72vh]"
      contentClassName="max-h-[62vh]"
    >
      <div className="space-y-4">
        {/* Contador */}
        <div className="text-sm text-gray-600 pb-2 border-b border-gray-200">
          <span className="font-semibold text-gray-900">{notifications.length}</span> notificaciones
          {unreadCount > 0 && (
            <>
              {' • '}
              <span className="font-semibold text-blue-600">{unreadCount}</span> sin leer
            </>
          )}
        </div>

        {/* Filtros y Acciones */}
        <div className="flex items-end gap-3">
          {/* Filtros a la izquierda */}
          <div className="flex-1">
            <NotificationFiltersComponent
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
          </div>

          {/* Botones a la derecha */}
          <div className="flex gap-2 pb-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refreshNotifications()}
              disabled={isLoading}
            >
              Actualizar
            </Button>

            {Object.keys(currentFilters).length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange({})}
              >
                Limpiar
              </Button>
            )}

            {unreadCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
              >
                {isMarkingAll ? 'Marcando...' : 'Marcar todas leídas'}
              </Button>
            )}
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[750px] min-h-[480px] overflow-y-auto pr-2">
          {isLoading && notifications.length === 0 ? (
            <div className="relative py-12 min-h-[300px]">
              <LoadingSpinner variant="paging" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <SystemIcons.interface.alert className="mx-auto h-12 w-12 text-red-400 mb-2" />
              <p className="text-red-800 font-medium">Error al cargar notificaciones</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refreshNotifications()}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <div className="min-h-[340px] h-full flex flex-col items-center justify-center text-center pt-6">
                <SystemIcons.interface.bell className="h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {Object.keys(currentFilters).length > 0
                    ? 'No se encontraron notificaciones con los filtros aplicados.'
                    : 'No tienes notificaciones en este momento.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedNotifications.map(([label, items]) => (
                <div key={label} className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-gris-una font-semibold">
                    {label}
                  </div>
                  <div className="space-y-3">
                    {items.map((notification) => (
                      <NotificationCard
                        key={notification.notificacion_id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        compact={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationCenter;
