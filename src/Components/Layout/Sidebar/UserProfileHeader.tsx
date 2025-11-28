import React from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/Components/Ui/Tooltip';
import { Button } from '@/Components/Ui/Button';
import { useAuth } from '@/Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/Utils/ClassNames';

interface UserProfileHeaderProps {
  className?: string;
}

/**
 * COMPONENTE DE PERFIL DE USUARIO EN HEADER
 * ==========================================
 * 
 * Muestra el nombre y rol del usuario autenticado con un botón de logout.
 * Se integra en el AppHeader en la sección derecha.
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-center gap-2.5 pr-6', className)}>
        {/* Información del Usuario - Avatar + Nombre/Rol */}
        <div className="flex items-center gap-2">
          {/* Avatar circular con borde rojo */}
          <div className="w-10 h-10 rounded-full bg-rojo-una/10 flex items-center justify-center border-2 border-rojo-una flex-shrink-0">
            <SystemIcons.users.user className="h-5 w-5 text-rojo-una" />
          </div>
          
          {/* Nombre y Rol - centrado en la mitad del ícono */}
          <div className="flex flex-col justify-center items-start">
            <p className="text-xs font-semibold text-negro-una leading-none">
              {user.nombre}
            </p>
            <p className="text-xs font-normal text-negro-una leading-none">
              {user.roles[0]?.name}
            </p>
          </div>
        </div>

        {/* Botón Logout con Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-negro-una hover:text-rojo-una-2 hover:bg-rojo-una/10"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <SystemIcons.actions.logout className="h-5 w-5 scale-x-[-1]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Cerrar sesión
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default UserProfileHeader;
