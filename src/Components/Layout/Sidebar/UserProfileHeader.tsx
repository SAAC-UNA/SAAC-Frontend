import React, { useState, useRef, useEffect } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/Components/Ui/Tooltip';
import { Button } from '@/Components/Ui/Button';
import { useAuth } from '@/Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/Utils/ClassNames';
import { NotificationDropdown } from '@/Components/Notifications/NotificationDropdown';
import NotificationCenter from '@/Pages/Notifications/NotificationCenter';
import { useNotifications } from '@/Hooks/useNotifications';

interface UserProfileHeaderProps {
  className?: string;
}

/**
 * COMPONENTE DE PERFIL DE USUARIO EN HEADER
 * ==========================================
 * 
 * Muestra el nombre y rol del usuario autenticado con un dropdown menu al hover.
 * Se integra en el AppHeader en la sección derecha.
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { unreadCount, refreshNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const handleToggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      refreshNotifications();
    }
  };

  // Detectar nuevas notificaciones para animar
  useEffect(() => {
    if (unreadCount > prevCount && prevCount > 0) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms de delay antes de cerrar
  };

  // Cerrar dropdown cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!user) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-center gap-3 pr-6', className)}>
        {/* Información del Usuario - Avatar con Dropdown */}
        <div 
          className="flex items-center gap-2 relative"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Avatar circular con borde gris oscuro */}
          <div className="w-10 h-10 rounded-full bg-gris-una/15 flex items-center justify-center border-2 border-gris-una/60 flex-shrink-0 cursor-pointer">
            <SystemIcons.users.user className="h-5 w-5 text-gris-una/60" />
          </div>

          {/* Dropdown Content */}
          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-blanco-una rounded-lg shadow-md border border-gris-una/15 z-50 py-1.5">
              {/* Información del Usuario */}
              <div className="px-3 py-2 border-b border-gris-una/25">
                <p className="text-[11px] font-semibold text-negro-una leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] font-normal text-negro-una/60 leading-none mt-1">
                  {user.roles[0]?.name}
                </p>
              </div>
              
              {/* Acciones */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-1.5 mx-0 text-left text-xs text-negro-una hover:bg-gris-una/8 flex items-center gap-2 transition-all duration-200 rounded-md"
              >
                <SystemIcons.actions.logout className="h-3.5 w-3.5 scale-x-[-1] flex-shrink-0" />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>

        {/* Botón Notificaciones con Tooltip y Dropdown */}
        <div className="relative" ref={notificationRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-negro-una hover:bg-gris-una/10 relative",
                  shouldShake && "animate-shake"
                )}
                aria-label="Notificaciones"
                onClick={handleToggleNotifications}
              >
                <SystemIcons.interface.bell className="h-5 w-5" />
                {/* Punto rojo indicador */}
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

        {/* Modal de Centro de Notificaciones */}
        <NotificationCenter
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Estilos para animación */}
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
      </div>
    </TooltipProvider>
  );
};

export default UserProfileHeader;
