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
import { buttonVariants } from "@/Components/Ui/Buttons/Button";
import { DROPDOWN_VARIANTS_UP, SPRING_SIDEBAR } from "@/Constants/Animations";
import { NotificationDropdown } from "@/Components/Notifications/NotificationDropdown";
import NotificationCenter from "@/Components/Notifications/NotificationModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Components/Ui/Feedback/Tooltip";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { ROUTES } from "@/Constants/ROUTES";

interface UserWidgetProps {
  className?: string;
  /** Estilo de texto oscuro para fondos con color */
  dark?: boolean;
  /** Mostrar botón de notificaciones */
  showNotifications?: boolean;
  /** Modo colapsado: solo íconos apilados verticalmente (para sidebar) */
  collapsed?: boolean;
}

export const UserWidget: React.FC<UserWidgetProps> = ({
  className,
  dark = false,
  showNotifications = false,
  collapsed = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, refreshNotifications } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCoords, setNotifCoords] = useState<{
    bottom: number;
    left: number;
  } | null>(null);

  const DROPDOWN_WIDTH = 384; // w-96
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bellHovered, setBellHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const bellRef = useRef<HTMLButtonElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const gap = 8;
    const left = Math.min(
      rect.right + gap,
      window.innerWidth - DROPDOWN_WIDTH - gap,
    );
    const anchorY = rect.top + rect.height / 2;
    const bottom = Math.max(gap, window.innerHeight - anchorY);
    setNotifCoords({ bottom, left });
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
    navigate(ROUTES.LOGIN);
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
      <div
        className={cn(
          collapsed
            ? "flex flex-col items-center gap-2"
            : "flex items-center gap-3 min-w-0",
          className,
        )}
      >
        {/* Ícono usuario con tooltip — solo en modo colapsado */}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(btnClass, "cursor-default")}
                aria-label={`${user.name} — ${roleName}`}
              >
                <SystemIcons.users.user
                  className={cn(APP_HEADER_BUTTON.icon, "text-negro-una-2")}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className={`${TYPOGRAPHY.body} font-semibold`}>{user.name}</p>
              <p className={`${TYPOGRAPHY.form.helper} font-semibold`}>
                {roleName}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* ? Nombre y rol — oculto en modo colapsado */}
        {!collapsed && (
          <div className="flex h-9 flex-col items-start justify-center translate-y-0.5">
            <span
              className={cn(
                "font-semibold leading-none text-xs",
                dark ? "text-blanco-una" : "text-negro-una",
              )}
            >
              {user.name}
            </span>
            <span
              className={cn(
                "-mt-0.5 leading-none text-[11px]",
                dark ? "text-blanco-una/70" : "text-gris-una",
              )}
            >
              {roleName}
            </span>
          </div>
        )}

        {/* Botón notificaciones */}
        {showNotifications && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <button
                  ref={bellRef}
                  type="button"
                  onClick={handleBellClick}
                  aria-label="Notificaciones"
                  aria-expanded={isNotifOpen}
                  aria-haspopup="dialog"
                  className={cn(
                    buttonVariants({ variant: "sidebarAction", size: "none" }),
                    bellHovered && "!bg-transparent",
                  )}
                  onMouseEnter={() => setBellHovered(true)}
                  onMouseLeave={() => setBellHovered(false)}
                >
                  {bellHovered && (
                    <motion.div
                      layoutId="sidebar-action-hover-indicator"
                      className="absolute inset-0 bg-rojo-una-2 rounded-corner -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={SPRING_SIDEBAR}
                    />
                  )}
                  <SystemIcons.interface.bell
                    className={cn(
                      APP_HEADER_BUTTON.icon,
                      "relative z-10 transition-colors duration-150",
                      bellHovered ? "text-blanco-una" : "text-negro-una-2",
                    )}
                  />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rojo-una-2 pointer-events-none ring-1.5 ring-blanco-una" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Notificaciones</TooltipContent>
          </Tooltip>
        )}

        {/* Botón cerrar sesión */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className={cn(
                buttonVariants({ variant: "sidebarAction", size: "none" }),
                logoutHovered && "!bg-transparent",
              )}
              onMouseEnter={() => setLogoutHovered(true)}
              onMouseLeave={() => setLogoutHovered(false)}
            >
              {logoutHovered && (
                <motion.div
                  layoutId="sidebar-action-hover-indicator"
                  className="absolute inset-0 bg-rojo-una-2 rounded-corner -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING_SIDEBAR}
                />
              )}
              <SystemIcons.actions.logout
                className={cn(
                  APP_HEADER_BUTTON.icon,
                  "relative z-10 transition-colors duration-150",
                  logoutHovered ? "text-blanco-una" : "text-negro-una-2",
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Cerrar sesión</TooltipContent>
        </Tooltip>
      </div>

      {/* Panel de notificaciones via portal */}
      {notifCoords &&
        createPortal(
          <AnimatePresence>
            {isNotifOpen && (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="fixed inset-0 z-[9998] bg-negro-una/5 backdrop-blur-[1.5px]"
                  onClick={() => setIsNotifOpen(false)}
                  aria-label="Cerrar panel de notificaciones"
                />
                <motion.div
                  ref={notifMenuRef}
                  variants={DROPDOWN_VARIANTS_UP}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    position: "fixed",
                    bottom: notifCoords.bottom,
                    left: notifCoords.left,
                    zIndex: 9999,
                    width: DROPDOWN_WIDTH,
                  }}
                >
                  <NotificationDropdown
                    onClose={() => setIsNotifOpen(false)}
                    onViewAll={() => {
                      setIsNotifOpen(false);
                      setIsModalOpen(true);
                    }}
                  />
                </motion.div>
              </>
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
