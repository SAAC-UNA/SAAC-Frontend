/**
 * NotificationDropdown - Dropdown de notificaciones recientes
 * HU-018 - Notificaciones automáticas
 *
 * Panel glassmorphism oscuro con ítems compactos y animaciones escalonadas.
 * Se renderiza vía portal desde UserBar al hacer clic en el botón de la campana.
 * Para la vista completa, ver NotificationCenter.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SPRING_HOVER } from "@/Constants/Animations";
import { Button, LoadingSpinner } from "@/Components/Ui/Index";
import { EmptyState } from "@/Components/Ui/Feedback/EmptyState";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { useNotifications } from "@/Hooks/useNotifications";
import { NotificationService } from "@/Services/NotificationService";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Notification } from "@/Types/NotificationTypes";

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

// ─── Ítem individual ──────────────────────────────────────────────────────────

const HOVER_LAYOUT_ID = "notif-dropdown-hover-bg";

interface DropdownItemProps {
  notification: Notification;
  index: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  notification,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onMarkAsRead,
  onClose,
}) => {
  const navigate = useNavigate();
  const targetRoute =
    notification.tipo_evento === "asignacion_evidencia"
      ? "/mis-evidencias-asignadas"
      : notification.enlace;

  const handleClick = () => {
    if (!notification.leida) onMarkAsRead(notification.notificacion_id);
    if (targetRoute) {
      navigate(targetRoute);
      onClose();
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      role={targetRoute ? "button" : "article"}
      tabIndex={targetRoute ? 0 : undefined}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onKeyDown={(e) => {
        if (targetRoute && (e.key === "Enter" || e.key === " ")) handleClick();
      }}
      className={cn(
        "relative px-4 py-3",
        targetRoute && "cursor-pointer",
        !notification.leida && "bg-azul-una/5",
      )}
      onClick={targetRoute ? handleClick : undefined}
    >
      {/* Fondo deslizable animado */}
      {isHovered && targetRoute && (
        <motion.div
          layoutId={HOVER_LAYOUT_ID}
          className="absolute inset-0 bg-gris-light/60"
          transition={SPRING_HOVER}
        />
      )}
      {/* Fila superior: dot + título + badge crítico + tiempo */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!notification.leida && (
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                notification.es_critica ? "bg-rojo-una" : "bg-azul-una-2",
              )}
            />
          )}
          <h4 className={cn(TYPOGRAPHY.form.label, "font-semibold text-negro-una-2 truncate")}>
            {notification.titulo}
          </h4>
          {notification.es_critica && (
            <StatusBadge
              label="Crítico"
              colorClasses="bg-error-light text-error"
            />
          )}
        </div>
        <span className={cn(TYPOGRAPHY.badge, "text-gris-una shrink-0 whitespace-nowrap")}>
          {timeAgo}
        </span>
      </div>

      {/* Mensaje */}
      <p
        className={cn(
          TYPOGRAPHY.form.helper,
          "relative z-10 mt-0.5 text-gris-una-2 line-clamp-2",
          !notification.leida && "ml-3.5",
        )}
      >
        {notification.mensaje}
      </p>
    </motion.div>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onViewAll,
}) => {
  const [notifData, setNotifData] = useState<{
    notifications: Notification[];
    loading: boolean;
  }>({ notifications: [], loading: true });

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { markAsRead, markAllAsRead, unreadCount } = useNotifications({
    enablePolling: false,
    autoFetch: false,
  });

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

  return (
    <div
      className={cn(
        "w-96 rounded-corner-md shadow-lg overflow-hidden",
        "bg-blanco-una",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gris-light">
        <h3 className={cn(TYPOGRAPHY.modal.subtitle, "font-semibold text-negro-una-2")}>
          Notificaciones
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="none"
            onClick={handleMarkAllAsRead}
            className={cn(
              TYPOGRAPHY.form.helper,
              "px-2 py-1 text-gris-una hover:text-negro-una hover:bg-gris-light rounded-corner-sm",
            )}
          >
            Marcar todas leídas
          </Button>
        )}
      </div>

      {/* Lista */}
      <div className="divide-y divide-gris-light max-h-96 overflow-y-auto">
        {notifData.loading ? (
          <div className="relative py-4 min-h-24">
            <LoadingSpinner variant="loader" className="scale-50" />
          </div>
        ) : notifData.notifications.length === 0 ? (
          <EmptyState
            variant="default"
            title="Sin notificaciones"
            description="No tienes notificaciones recientes"
            compact
          />
        ) : (
          notifData.notifications.map((notification, index) => (
            <DropdownItem
              key={notification.notificacion_id}
              notification={notification}
              index={index}
              isHovered={hoveredId === notification.notificacion_id}
              onHoverStart={() => setHoveredId(notification.notificacion_id)}
              onHoverEnd={() => setHoveredId(null)}
              onMarkAsRead={handleMarkAsRead}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center">
        <Button
          variant="invisible"
          size="none"
          onClick={() => { onClose(); onViewAll(); }}
          className={cn(
            TYPOGRAPHY.form.helper,
            "w-50 py-3 text-gris-una hover:text-negro-una",
          )}
        >
          Ver notificaciones
        </Button>
      </div>
    </div>
  );
};
