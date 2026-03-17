import React, { useState, useRef, useEffect } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/Components/Ui/Feedback/Tooltip';
import { Button } from '@/Components/Ui/Buttons/Button';
import { useAuth } from '@/Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/Utils/ClassNames';
import { APP_HEADER_BUTTON } from '@/Constants/Components';
import { NotificationDropdown } from '@/Components/Notifications/NotificationDropdown';
import NotificationCenter from '@/Pages/Notifications/NotificationCenter';
import { useNotifications } from '@/Hooks/useNotifications';

interface UserProfileHeaderProps {
  className?: string;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  showQuickLogout?: boolean;
  showInlineIdentity?: boolean;
  useSidebarAvatarStyle?: boolean;
}

/**
 * COMPONENTE DE PERFIL DE USUARIO EN HEADER
 * ==========================================
 * 
 * Muestra notificaciones, logout rápido y/o bloque de usuario según props.
 * Se integra en header y en footer del sidebar.
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  className,
  showUserMenu = true,
  showNotifications = true,
  showQuickLogout = false,
  showInlineIdentity = false,
  useSidebarAvatarStyle = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevCountRef = useRef(0);
  const [shouldShake, setShouldShake] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { unreadCount, refreshNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      refreshNotifications();
    }
  };

  // Detectar nuevas notificaciones para animar
  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current > 0) {
      prevCountRef.current = unreadCount;
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Cerrar dropdown cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user || (!showUserMenu && !showNotifications && !showQuickLogout)) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-center gap-2 pr-6 min-w-0 max-w-full', className)}>
        {/* Información del Usuario - Avatar con Dropdown */}
        {showUserMenu && (
          <div className="flex items-center gap-2 relative min-w-0 w-full">
            {/* Avatar circular con borde gris oscuro */}
            {/** TODO Todo esto debería de ser un botón, no un div, así podemos manejar los colores por separado porque si se elimina h-5 w-5 por alguna razón el ícono se vuelve negro (quizá hay que revisar los estilos en index) */}
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer',
              (showInlineIdentity || useSidebarAvatarStyle)
                ? 'bg-blanco-una/10 border border-blanco-una/40'
                : 'bg-blanco-una-2 border-2 border-gris-una'
            )}>
              <SystemIcons.users.user className={`${APP_HEADER_BUTTON.icon} ${(showInlineIdentity || useSidebarAvatarStyle) ? 'text-blanco-una' : 'text-gris-una'}`} />
            </div>

            {showInlineIdentity && (
              <div className="min-w-0 pr-1 w-[150px] max-w-[150px]">
                <p className="block w-full truncate text-blanco-una font-semibold leading-tight text-xs" title={user.name}>
                  {user.name}
                </p>
                <p className="block w-full truncate text-blanco-una/80 leading-tight text-[11px]" title={user.roles[0]?.name || ''}>
                  {user.roles[0]?.name || 'Sin rol'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón Notificaciones con Tooltip y Dropdown */}
        {showNotifications && (
          <div className="relative" ref={notificationRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  APP_HEADER_BUTTON.button,
                  "text-gris-una hover:bg-gris-una/10 relative",
                  shouldShake && "animate-shake"
                )}
                aria-label="Notificaciones"
                onClick={handleToggleNotifications}
              >
                <SystemIcons.interface.bell className={`${APP_HEADER_BUTTON.icon}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Notificaciones
            </TooltipContent>
          </Tooltip>

          {/* Dropdown de notificaciones */}
          {isNotificationOpen && (
            <NotificationDropdown
              onClose={() => setIsNotificationOpen(false)}
              onViewAll={() => {
                setIsNotificationOpen(false);
                setIsModalOpen(true);
              }}
            />
          )}
          </div>
        )}

        {/* Botón rápido de cerrar sesión */}
        {showQuickLogout && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  APP_HEADER_BUTTON.button,
                  'text-gris-una hover:bg-gris-una/10'
                )}
                aria-label="Cerrar sesión"
                onClick={handleLogout}
              >
                <SystemIcons.actions.logout className={APP_HEADER_BUTTON.icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Cerrar sesión
            </TooltipContent>
          </Tooltip>
        )}

        {/* TODO Modal de Centro de Notificaciones */}
        {showNotifications && (
          <NotificationCenter
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {/* Estilos para animación */}
        {showNotifications && (
          <style>{`
            @keyframes shake {
              0%, 100% { transform: rotate(0deg); }
              10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
              20%, 40%, 60%, 80% { transform: rotate(10deg); }
            }
            .animate-shake {
              animation: shake 0.5s ease-in-out;
            }
          `}</style>
        )}
      </div>
    </TooltipProvider>
  );
};

