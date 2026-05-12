/**
 * NotificationCard - Tarjeta de notificación individual
 * HU-018 - Notificaciones automáticas
 *
 * Diseño limpio sin ícono ni borde de color. Fecha arriba a la derecha.
 * Animación blur+x escalonada via prop index.
 */

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { SPRING_HOVER } from "@/Constants/Animations";
import type { Notification } from "@/Types/NotificationTypes";
import { buildNotificationTargetRoute } from "@/Components/Notifications/notificationNavigation";
import { formatTimeAgo } from "@/Utils/DateUtils";
import { Button } from "@/Components/Ui/Index";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import {
  buildNotificationCopy,
  isNotificationImportant,
} from "@/Components/Notifications/notificationCopy";

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
  const targetRoute = buildNotificationTargetRoute(notification);

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
  const [isExpanded, setIsExpanded] = useState(false);

  const notificationCopy = useMemo(
    () => buildNotificationCopy(notification),
    [notification],
  );
  const isImportant = useMemo(
    () => isNotificationImportant(notification),
    [notification],
  );

  const toggleTarget = notificationCopy.evaluatorComment ?? notificationCopy.summary;
  const canToggleMessage = !compact && toggleTarget.length > 180;
  const toggleLabel = isExpanded ? "Ver menos" : "Ver más";

  const timeAgo = formatTimeAgo(notification.created_at);

  const handleToggleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

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
      {/* Fila superior: dot + título + badge de prioridad + fecha */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!notification.leida && (
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                isImportant ? "bg-rojo-una" : "bg-azul-una-2",
              )}
            />
          )}
          <h4 className={cn(TYPOGRAPHY.form.label, "font-semibold text-negro-una-2 truncate")}>
            {notification.titulo}
          </h4>
          {isImportant && (
            <StatusBadge
              label="Importante"
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
          "mt-0.5 text-gris-una-2 wrap-anywhere whitespace-pre-line",
          compact && "line-clamp-2",
          !compact && !notificationCopy.isReviewCorrectionMessage && !isExpanded && "line-clamp-3",
          !notification.leida && "ml-3.5",
        )}
      >
        {notificationCopy.summary}
      </p>

      {notificationCopy.evaluatorComment && (
        <div
          className={cn(
            "relative z-10 mt-1.5",
            !notification.leida && "ml-3.5",
          )}
        >
          <p
            className={cn(
              TYPOGRAPHY.form.helper,
              "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1",
            )}
          >
            <span className="font-semibold text-error whitespace-nowrap">Observación del evaluador:</span>
            <span
              className={cn(
                "text-gris-una-2 wrap-anywhere whitespace-pre-line",
                !isExpanded && canToggleMessage && "line-clamp-3",
              )}
            >
              {notificationCopy.evaluatorComment}
            </span>
          </p>
        </div>
      )}

      {notificationCopy.deadlineText && (
        <p
          className={cn(
            TYPOGRAPHY.badge,
            "relative z-10 mt-1 text-warning-dark",
            !notification.leida && "ml-3.5",
          )}
        >
          Nueva fecha límite: {notificationCopy.deadlineText}
        </p>
      )}

      {/* Acciones */}
      {!compact && (onMarkAsRead || onDelete) && (
        <div
          className={cn("relative z-10",
            "mt-2 flex items-center justify-end gap-2 flex-wrap",
            !notification.leida && "ml-3.5",
          )}
        >
          {!notification.leida && onMarkAsRead && (
            <Button
              variant="ghost"
              size="none"
              onClick={handleMarkAsRead}
              className={cn(
                TYPOGRAPHY.badge,
                "rounded-corner-sm px-2 py-1 text-info hover:text-info-dark hover:bg-info-light/60 font-medium cursor-pointer",
              )}
              aria-label="Marcar como leída"
            >
              Marcar leída
            </Button>
          )}

          {canToggleMessage && (
            <Button
              variant="ghost"
              size="none"
              onClick={handleToggleMessage}
              className={cn(
                TYPOGRAPHY.badge,
                "inline-flex items-center gap-1 rounded-corner-sm px-2 py-1 text-azul-una-2 hover:text-azul-una hover:bg-info-light/50 font-semibold cursor-pointer",
              )}
              aria-label={isExpanded ? "Ver menos detalle de notificación" : "Ver más detalle de notificación"}
            >
              {isExpanded ? (
                <SystemIcons.interface.chevronUp className="w-3.5 h-3.5" />
              ) : (
                <SystemIcons.interface.chevronDown className="w-3.5 h-3.5" />
              )}
              {toggleLabel}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="none"
              onClick={handleDelete}
              className={cn(
                TYPOGRAPHY.badge,
                "inline-flex items-center gap-1 rounded-corner-sm px-2 py-1 text-error-dark hover:text-error hover:bg-error-light/60 font-semibold cursor-pointer",
              )}
              aria-label="Eliminar notificación"
            >
              <SystemIcons.actions.delete className="w-3.5 h-3.5" />
              Eliminar
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
