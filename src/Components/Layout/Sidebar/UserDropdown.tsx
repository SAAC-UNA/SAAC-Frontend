/**
 * UserDropdown - Dropdown de usuario autenticado
 *
 * Muestra avatar con iniciales como trigger.
 * El menú incluye: info del usuario, notificaciones y cerrar sesión.
 * Usa portal + framer-motion consistente con DropdownButton y otros componentes.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/Hooks/useNotifications';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { DROPDOWN_VARIANTS, SPRING_HOVER } from '@/Constants/Animations';

interface UserDropdownProps {
  /** Estilo oscuro para uso sobre fondo rojo (sidebar) */
  dark?: boolean;
  onNotificationsClick?: () => void;
  /** Mostrar nombre y rol al lado del avatar en el trigger */
  showIdentity?: boolean;
}

/** Obtiene las iniciales de un nombre completo (máx. 2 caracteres) */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  dark = false,
  onNotificationsClick,
  showIdentity = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerId = 'user-dropdown-menu';

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuCoords({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reposicionar en scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const recalc = () => calculatePosition();
    window.addEventListener('scroll', recalc, true);
    window.addEventListener('resize', recalc);
    return () => {
      window.removeEventListener('scroll', recalc, true);
      window.removeEventListener('resize', recalc);
    };
  }, [isOpen, calculatePosition]);

  const handleToggle = () => {
    if (!isOpen) calculatePosition();
    setIsOpen((v) => !v);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const handleNotifications = () => {
    setIsOpen(false);
    onNotificationsClick?.();
  };

  if (!user) return null;

  const initials = getInitials(user.name);
  const roleName = user.roles?.[0]?.name ?? 'Sin rol';

  // ── Items del menú ──────────────────────────────────────────────
  const menuItems: {
    id: string;
    icon: React.ReactNode;
    label: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    badge?: number;
  }[] = [
    ...(onNotificationsClick
      ? [
          {
            id: 'notifications',
            icon: <SystemIcons.interface.bell className={ICON_SIZES.sm} />,
            label: (
              <span className="flex items-center gap-2">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rojo-una-2 text-blanco-una text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            ),
            onClick: handleNotifications,
          },
        ]
      : []),
    {
      id: 'logout',
      icon: <SystemIcons.actions.logout className={ICON_SIZES.sm} />,
      label: 'Cerrar sesión',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      {/* Trigger: Avatar (+ identidad opcional) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-2.5 cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-corner',
          'transition-opacity duration-150 hover:opacity-80',
          dark
            ? 'focus-visible:ring-blanco-una/60'
            : 'focus-visible:ring-gris-una',
        )}
      >
        {/* Avatar circular */}
        <span
          className={cn(
            'relative w-9 h-9 rounded-full flex-shrink-0',
            dark
              ? 'bg-blanco-una/15 border border-blanco-una/40'
              : 'bg-blanco-una-2 border-2 border-gris-una',
          )}
        >
          {/* Iniciales centradas con inset-0 para equidistancia exacta horizontal y vertical */}
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'font-semibold leading-none select-none pointer-events-none text-[11px]',
              dark ? 'text-blanco-una' : 'text-negro-una-2',
            )}
          >
            {initials}
          </span>

          {/* Indicador de notificaciones no leídas */}
          {unreadCount > 0 && onNotificationsClick && (
            <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-rojo-una-2 pointer-events-none" />
          )}
        </span>

        {/* Nombre y rol al lado del avatar */}
        {showIdentity && (
          <span className="flex flex-col items-start min-w-0">
            <span
              className={cn(
                'font-semibold leading-tight truncate max-w-[140px] text-xs',
                dark ? 'text-blanco-una' : 'text-negro-una',
              )}
              title={user.name}
            >
              {user.name}
            </span>
            <span
              className={cn(
                'leading-tight truncate max-w-[140px] text-[11px]',
                dark ? 'text-blanco-una/70' : 'text-gris-una',
              )}
              title={roleName}
            >
              {roleName}
            </span>
          </span>
        )}
      </button>

      {/* Menú via portal */}
      {menuCoords &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                key={containerId}
                variants={DROPDOWN_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: 'fixed',
                  top: menuCoords.top,
                  right: menuCoords.right,
                  zIndex: 9999,
                }}
                className="w-64 rounded-corner bg-blanco-una border border-gris-light shadow-lg overflow-hidden"
                role="menu"
              >
                {/* Sección: info del usuario */}
                <div className="px-4 py-3 border-b border-gris-light">
                  <div className="flex items-center gap-3">
                    {/* Avatar grande */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-rojo-una-2/10 border border-rojo-una-2/20">
                      <span className="text-rojo-una-2 font-bold text-sm leading-none select-none">
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'font-semibold text-negro-una truncate',
                          TYPOGRAPHY.body,
                        )}
                        title={user.name}
                      >
                        {user.name}
                      </p>
                      <p
                        className={cn('text-gris-una truncate', TYPOGRAPHY.form.helper)}
                        title={roleName}
                      >
                        {roleName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección: acciones */}
                <div
                  className="py-1"
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={item.onClick}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      className={cn(
                        `relative w-full text-left px-4 py-2.5 flex items-center gap-3 focus:outline-none cursor-pointer ${TYPOGRAPHY.button}`,
                        item.danger ? 'text-rojo-una-2' : 'text-negro-una-2',
                      )}
                    >
                      {/* Fondo hover deslizante */}
                      {hoveredItem === item.id && (
                        <motion.div
                          layoutId="user-dropdown-hover"
                          className={cn(
                            'absolute inset-x-1 inset-y-0.5 rounded-sm -z-10',
                            item.danger ? 'bg-rojo-una-2/10' : 'bg-gris-light/60',
                          )}
                          transition={SPRING_HOVER}
                        />
                      )}
                      <span className="flex-shrink-0 relative z-10">{item.icon}</span>
                      <span className="relative z-10 flex-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
