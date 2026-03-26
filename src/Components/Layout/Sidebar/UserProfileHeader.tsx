import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { cn } from '@/Utils/ClassNames';
import { NotificationDropdown } from '@/Components/Notifications/NotificationDropdown';
import NotificationCenter from '@/Pages/Notifications/NotificationCenter';
import { useNotifications } from '@/Hooks/useNotifications';
import { TooltipProvider } from '@/Components/Ui/Feedback/Tooltip';
import { UserDropdown } from './UserDropdown';

interface UserProfileHeaderProps {
  className?: string;
  /** Mostrar el avatar con el dropdown de usuario */
  showUserMenu?: boolean;
  /** Habilitar acceso a notificaciones desde el dropdown de usuario */
  showNotifications?: boolean;
  /** Mostrar nombre y rol al lado del avatar (ej: footer mobile del sidebar) */
  showInlineIdentity?: boolean;
  /** Estilo oscuro del avatar para fondos con color (sidebar) */
  useSidebarAvatarStyle?: boolean;
}

/**
 * COMPONENTE DE PERFIL DE USUARIO
 * ================================
 *
 * Wrapper que combina el avatar-dropdown del usuario con la identidad inline opcional.
 * Las acciones de logout y notificaciones están consolidadas dentro de UserDropdown.
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  className,
  showUserMenu = true,
  showNotifications = true,
  showInlineIdentity = false,
  useSidebarAvatarStyle = false,
}) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Trigger de shake ya se maneja internamente en el ícono de notificaciones del dropdown,
  // pero mantenemos el ref para cerrar el panel al hacer click fuera.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar panel al abrir modal y viceversa
  const handleOpenNotifications = () => {
    refreshNotifications();
    setIsNotificationOpen(true);
  };

  if (!user || !showUserMenu) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-center gap-2 min-w-0 max-w-full', className)}>

        {/* Avatar con dropdown (contiene logout + notificaciones) */}
        <UserDropdown
          dark={useSidebarAvatarStyle}
          showIdentity={showInlineIdentity}
          onNotificationsClick={showNotifications ? handleOpenNotifications : undefined}
        />

        {/* Panel de notificaciones recientes */}
        {showNotifications && (
          <div ref={notificationRef}>
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

        {/* Modal centro de notificaciones */}
        {showNotifications && (
          <NotificationCenter
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};


