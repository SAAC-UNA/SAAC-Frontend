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

import React, { useMemo, useState } from "react";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { Button, LoadingSpinner } from "@/Components/Ui/Index";
import { Alert } from "@/Components/Ui/Feedback/Alert";
import { EmptyState } from "@/Components/Ui/Feedback/EmptyState";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/Components/Ui/Feedback/Tooltip";
import { NotificationCard } from "@/Components/Notifications/NotificationCard";
import { NotificationFiltersComponent } from "@/Components/Notifications/NotificationFilters";
import { useNotifications } from "@/Hooks/useNotifications";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { ICON_SIZES } from "@/Constants/Components";
import type { NotificationFilters } from "@/Types/NotificationTypes";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications({
    enablePolling: true,
    autoFetch: true,
  });

  const [currentFilters, setCurrentFilters] = useState<NotificationFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.titulo.toLowerCase().includes(q) ||
        n.mensaje.toLowerCase().includes(q),
    );
  }, [notifications, searchQuery]);

  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, typeof notifications>();

    const getLabel = (dateString: string) => {
      const date = new Date(dateString);
      if (isToday(date)) return "Hoy";
      if (isYesterday(date)) return "Ayer";
      return format(date, "dd MMM yyyy", { locale: es });
    };

    filteredNotifications.forEach((notification) => {
      const label = getLabel(notification.created_at);
      const list = groups.get(label) || [];
      list.push(notification);
      groups.set(label, list);
    });

    return Array.from(groups.entries());
  }, [filteredNotifications]);

  // Aplicar filtros
  const handleFilterChange = (filters: NotificationFilters) => {
    setCurrentFilters(filters);
    fetchNotifications(filters);
  };


  // Marcar una como leída
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Eliminar notificación
  const handleDelete = async (id: number) => {
    const confirmed = confirm(
      "¿Está seguro que desea eliminar esta notificación?",
    );
    if (!confirmed) return;

    try {
      await deleteNotification(id);
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Notificaciones"
      subtitle="Gestione y filtre sus notificaciones"
      size="lg"
      maxHeight="xl"
      variant="neutral"
      heroIcon={
        <SystemIcons.interface.bell className="h-5 w-5 text-blanco-una" />
      }
      showCancel
      cancelLabel="Cerrar"
    >
      <div className="space-y-4">
        {/* Contador + Filtros + Acciones en una sola línea */}
        <div className="flex items-center gap-3">
          {/* Contador */}
          <span className={cn(TYPOGRAPHY.form.helper, "text-gris-una shrink-0")}>
            {filteredNotifications.length} notificaciones
            {unreadCount > 0 && (
              <>
                {" • "}
                <span className="text-azul-una-2">{unreadCount} sin leer</span>
              </>
            )}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Filtros + Acciones a la derecha */}
          <div className="flex items-center gap-2">
            <NotificationFiltersComponent
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
              onSearchChange={setSearchQuery}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="none"
                  onClick={() => refreshNotifications()}
                  disabled={isLoading}
                  className="p-1.5 rounded-corner-sm text-gris-una hover:text-negro-una hover:bg-gris-light"
                  aria-label="Actualizar notificaciones"
                >
                  <SystemIcons.interface.refresh className={ICON_SIZES.sm} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[52vh] min-h-65 overflow-y-auto divide-y divide-gris-light">
          {isLoading && notifications.length === 0 ? (
            <div className="relative py-12 min-h-100">
              <LoadingSpinner variant="loader" />
            </div>
          ) : error ? (
            <Alert
              variant="error"
              title="Error al cargar notificaciones"
              message={error}
              dismissible={false}
              action={{
                label: "Reintentar",
                onClick: () => refreshNotifications(),
              }}
            />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              variant="search"
              icon={<SystemIcons.interface.bell className="w-12 h-12 text-gris-una/40" />}
              title="No hay notificaciones"
              description={
                Object.keys(currentFilters).length > 0 || searchQuery
                  ? "No se encontraron notificaciones con los filtros aplicados."
                  : "No tienes notificaciones en este momento."
              }
            />
          ) : (
            <div>
              {groupedNotifications.map(([label, items]) => (
                <div key={label}>
                  {/* Separador con fecha a la derecha */}
                  <div className="flex items-center gap-3 px-4 py-1.5">
                    <div className="flex-1 h-px bg-gris-light" />
                    <span className={cn(TYPOGRAPHY.badge, "text-gris-una uppercase tracking-wide shrink-0")}>
                      {label}
                    </span>
                  </div>
                  <div className="divide-y divide-gris-light">
                    {items.map((notification, index) => (
                      <NotificationCard
                        key={notification.notificacion_id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        compact={false}
                        onNavigate={onClose}
                        index={index}
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
