/**
 * NotificationPopover - Popover ligero de notificaciones (componente UI genérico)
 *
 * Uso: componente autocontenido con estado interno. Acepta lista de notificaciones
 * genéricas vía props y llama onNotificationsChange al mutar el estado local.
 *
 * Para notificaciones del backend, ver NotificationDropdown que usa useNotifications.
 *
 * Animaciones: PANEL_VARIANTS (panel y:10/scale:0.95) + blur+x:20 escalonado por ítem
 */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/Ui/Buttons/Button";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { cn } from "@/Utils/ClassNames";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { APP_HEADER_BUTTON } from "@/Constants/Components";

// Animación del panel: entra desde abajo con escala (igual al prompt original)
const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
};

export type PopoverNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
};

// ─── Item ─────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: PopoverNotification;
  index: number;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, index, onMarkAsRead }: NotificationItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className={cn(
      "px-4 py-3 cursor-pointer transition-colors",
      "hover:bg-blanco-una/10",
    )}
    onClick={() => onMarkAsRead(notification.id)}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {!notification.read && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-azul-una-2" />
        )}
        <h4 className={cn(TYPOGRAPHY.form.label, "font-semibold text-blanco-una truncate")}>
          {notification.title}
        </h4>
      </div>
      <span className={cn(TYPOGRAPHY.badge, "text-blanco-una/60 shrink-0 whitespace-nowrap")}>
        {notification.timestamp.toLocaleDateString("es-CR")}
      </span>
    </div>
    <p className={cn(TYPOGRAPHY.form.helper, "mt-0.5 text-blanco-una/65 line-clamp-2")}>
      {notification.description}
    </p>
  </motion.div>
);

// ─── Popover ──────────────────────────────────────────────────────────────────

export interface NotificationPopoverProps {
  notifications?: PopoverNotification[];
  onNotificationsChange?: (notifications: PopoverNotification[]) => void;
  triggerClassName?: string;
}

const defaultNotifications: PopoverNotification[] = [
  {
    id: "1",
    title: "Nuevo mensaje",
    description: "Has recibido un nuevo mensaje de Juan Pérez.",
    timestamp: new Date(),
    read: false,
  },
  {
    id: "2",
    title: "Actualización del sistema",
    description: "Mantenimiento programado para mañana.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    title: "Recordatorio",
    description: "Reunión con el equipo a las 2 PM.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications: initialNotifications = defaultNotifications,
  onNotificationsChange,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PopoverNotification[]>(initialNotifications);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Cierre al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    onNotificationsChange?.(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    onNotificationsChange?.(updated);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <Button
        variant="ghost"
        size="none"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(APP_HEADER_BUTTON.button, "relative", triggerClassName)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <SystemIcons.interface.bell className={APP_HEADER_BUTTON.icon} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rojo-una text-[9px] font-bold text-blanco-una select-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute right-0 mt-2 w-80 max-h-100 overflow-y-auto rounded-corner-md shadow-xl z-50",
              "bg-negro-una-2/90 backdrop-blur-md",
              "border border-blanco-una/10",
              "overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blanco-una/10">
              <h3 className={cn(TYPOGRAPHY.modal.subtitle, "font-semibold text-blanco-una")}>
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="none"
                  onClick={markAllAsRead}
                  className={cn(
                    TYPOGRAPHY.form.helper,
                    "px-2 py-1 text-blanco-una/70 hover:text-blanco-una hover:bg-blanco-una/10 rounded-corner-sm",
                  )}
                >
                  Marcar todas leídas
                </Button>
              )}
            </div>

            {/* Lista con divide-y por ítem */}
            <div className="divide-y divide-blanco-una/10">
              {notifications.length === 0 ? (
                <p className={cn(TYPOGRAPHY.form.helper, "px-4 py-6 text-center text-blanco-una/50")}>
                  No hay notificaciones
                </p>
              ) : (
                notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    index={index}
                    onMarkAsRead={markAsRead}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
