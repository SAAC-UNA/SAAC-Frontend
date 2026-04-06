/**
 * NotificationCard - Tarjeta de notificación individual
 * HU-018 - Notificaciones automáticas
 *
 * Diseño limpio sin ícono ni borde de color. Fecha arriba a la derecha.
 * Animación blur+x escalonada via prop index.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { SPRING_HOVER } from "@/Constants/Animations";
import type { Notification } from "@/Types/NotificationTypes";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/Components/Ui/Index";

const HOVER_LAYOUT_ID = "notif-card-hover-bg";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
  onNavigate?: () => void;
  index?: number;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
  onNavigate,
  index = 0,
}) => {
  const navigate = useNavigate();
  const targetRoute =
    notification.tipo_evento === "asignacion_evidencia"
      ? "/mis-evidencias-asignadas"
      : notification.tipo_evento === "asignacion_elemento"
        ? "/mis-evidencias-asignadas"
        : notification.enlace;

  const handleClick = () => {
    if (!notification.leida && onMarkAsRead) {
      onMarkAsRead(notification.notificacion_id);
    }
    if (targetRoute) {
      navigate(targetRoute);
      onNavigate?.();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.notificacion_id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.notificacion_id);
  };

  const [isHovered, setIsHovered] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      role={targetRoute ? "button" : "article"}
      tabIndex={targetRoute ? 0 : undefined}
      onClick={targetRoute ? handleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (targetRoute && (e.key === "Enter" || e.key === " ")) handleClick();
      }}
      className={cn(
        "relative px-4 py-3",
        targetRoute && "cursor-pointer",
        !notification.leida && "bg-azul-una/5",
      )}
    >
      {isHovered && targetRoute && (
        <motion.div
          layoutId={HOVER_LAYOUT_ID}
          className="absolute inset-0 bg-gris-light/60"
          transition={SPRING_HOVER}
        />
      )}
      {/* Fila superior: dot + título + badge crítico + fecha */}
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
        className={cn("relative z-10",
          TYPOGRAPHY.form.helper,
          "mt-0.5 text-gris-una-2",
          compact && "line-clamp-2",
          !notification.leida && "ml-3.5",
        )}
      >
        {notification.mensaje}
      </p>

      {/* Acciones */}
      {!compact && (onMarkAsRead || onDelete) && (
        <div
          className={cn("relative z-10",
            "flex items-center gap-3 mt-1.5",
            !notification.leida && "ml-3.5",
          )}
        >
          {!notification.leida && onMarkAsRead && (
            <Button
              variant="invisible"
              size="none"
              onClick={handleMarkAsRead}
              className={cn(TYPOGRAPHY.badge, "text-info hover:text-info-dark hover:underline font-medium cursor-pointer")}
              aria-label="Marcar como leída"
            >
              Marcar leída
            </Button>
          )}
          {onDelete && (
            <Button
              variant="invisible"
              size="none"
              onClick={handleDelete}
              className={cn(TYPOGRAPHY.badge, "text-error hover:text-error-dark hover:underline font-medium ml-auto cursor-pointer")}
              aria-label="Eliminar notificación"
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
