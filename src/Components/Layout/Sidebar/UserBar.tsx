/**
 * UserWidget - Widget de usuario autenticado
 *
 * Muestra nombre, rol y botones de acción (notificaciones y cerrar sesión) en línea.
 * El botón de notificaciones abre un panel via portal con framer-motion.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/Hooks/useNotifications";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { cn } from "@/Utils/ClassNames";
import { APP_HEADER_BUTTON } from "@/Constants/Components";
import { DROPDOWN_VARIANTS, SPRING_HOVER } from "@/Constants/Animations";
import { NotificationDropdown } from "@/Components/Notifications/NotificationDropdown";
import NotificationCenter from "@/Pages/Notifications/NotificationCenter";

interface UserWidgetProps {
  className?: string;
  /** Estilo de texto oscuro para fondos con color */
  dark?: boolean;
  /** Mostrar botón de notificaciones */
  showNotifications?: boolean;
}

export const UserWidget: React.FC<UserWidgetProps> = ({
  className,
  dark = false,
  showNotifications = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, refreshNotifications } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCoords, setNotifCoords] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bellHovered, setBellHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const bellRef = useRef<HTMLButtonElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    setNotifCoords({
      top: rect.bottom,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        !bellRef.current?.contains(e.target as Node) &&
        !notifMenuRef.current?.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    }

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotifOpen]);

  useEffect(() => {
    if (!isNotifOpen) return;
    const recalc = () => calculatePosition();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [isNotifOpen, calculatePosition]);

  const handleBellClick = () => {
    if (!isNotifOpen) {
      calculatePosition();
      refreshNotifications();
    }
    setIsNotifOpen((v) => !v);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const roleName = user.roles?.[0]?.name ?? "Sin rol";

  const btnClass = cn(
    "relative flex items-center justify-center cursor-pointer overflow-hidden",
    APP_HEADER_BUTTON.button,
    "rounded-corner",
    "bg-blanco-una shadow-md",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-gris-una focus-visible:ring-offset-1",
  );

  return (
    <>
      <div className={cn("flex items-center gap-3 min-w-0 py-1", className)}>
        {/* Nombre y rol */}
        <div className="flex flex-col items-start">
          <span
            className={cn(
              "font-semibold leading-tight text-xs",
              dark ? "text-blanco-una" : "text-negro-una",
            )}
          >
            {user.name}
          </span>
          <span
            className={cn(
              "leading-tight text-[11px]",
              dark ? "text-blanco-una/70" : "text-gris-una",
            )}
          >
            {roleName}
          </span>
        </div>

        {/* Botón notificaciones */}
        {showNotifications && (
          <button
            ref={bellRef}
            type="button"
            onClick={handleBellClick}
            aria-label="Notificaciones"
            aria-expanded={isNotifOpen}
            aria-haspopup="dialog"
            className={btnClass}
            onMouseEnter={() => setBellHovered(true)}
            onMouseLeave={() => setBellHovered(false)}
          >
            <motion.span
              className="absolute inset-0 bg-rojo-una-2 pointer-events-none"
              animate={{ opacity: bellHovered ? 1 : 0 }}
              transition={SPRING_HOVER}
            />
            <SystemIcons.interface.bell
              className={cn(
                APP_HEADER_BUTTON.icon,
                "relative z-10 transition-colors duration-150",
                bellHovered ? "text-blanco-una" : "text-negro-una-2",
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rojo-una-2 pointer-events-none ring-1 ring-blanco-una" />
            )}
          </button>
        )}

        {/* Botón cerrar sesión */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className={btnClass}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
        >
          <motion.span
            className="absolute inset-0 bg-rojo-una-2 pointer-events-none"
            animate={{ opacity: logoutHovered ? 1 : 0 }}
            transition={SPRING_HOVER}
          />
          <SystemIcons.actions.logout
            className={cn(
              APP_HEADER_BUTTON.icon,
              "relative z-10 transition-colors duration-150",
              logoutHovered ? "text-blanco-una" : "text-negro-una-2",
            )}
          />
        </button>
      </div>

      {/* Panel de notificaciones via portal */}
      {notifCoords &&
        createPortal(
          <AnimatePresence>
            {isNotifOpen && (
              <div
                style={{
                  position: "fixed",
                  top: notifCoords.top,
                  right: notifCoords.right,
                  zIndex: 9999,
                  width: 0,
                  height: 0,
                }}
              >
                <motion.div
                  ref={notifMenuRef}
                  variants={DROPDOWN_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: "relative" }}
                >
                  <NotificationDropdown
                    onClose={() => setIsNotifOpen(false)}
                    onViewAll={() => {
                      setIsNotifOpen(false);
                      setIsModalOpen(true);
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Modal de centro de notificaciones */}
      <NotificationCenter
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
