import React from 'react';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { useSidebar } from '@/Context/SidebarContext';
import { APP_HEADER_BUTTON } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';
//import { TYPOGRAPHY } from '@/Constants/Typography';

/**
 * HEADER DE LA APLICACIÓN CON TRIGGER DEL SIDEBAR
 * ===============================================
 * 
 * Componente que unifica el header de la aplicación con el control
 * del sidebar. Incluye el botón de hamburguesa integrado.
 * 
 * RESPONSABILIDADES:
 * - Mostrar logo y título de la aplicación
 * - Incluir trigger del sidebar (botón hamburguesa)
 * - Mantener layout consistente del header
 * - Manejar responsive design del header
 * 
 * UNIFICACIÓN: Este componente reemplaza el uso separado de
 * SidebarTrigger + header manual, centralizando toda la lógica
 * del header de la aplicación.
 */

interface AppHeaderProps {
  className?: string;
  title?: string;
  logo?: string;
  logoAlt?: string;
  rightContent?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  className,
//  title = "SAAC",
//  logo = "/Images/SAAC.png",
  //logo = "/Images/book.svg",
//  logoAlt = "SAAC Logo",
  rightContent
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className={cn(
      "flex h-12 shrink-0 items-center gap-2 border-b-blanco-una/20 px-4",
      className
    )}>
      {/* Trigger del Sidebar (botón hamburguesa) */}
      <Button
        variant="ghost"
        className={`${APP_HEADER_BUTTON.button} mr-2`}
        onClick={() => toggleSidebar()}
      >
        <SystemIcons.navigation.menu className={APP_HEADER_BUTTON.icon} />
        {/* Este texto salta cuando el usuario usa un lector de pantalla como NVDA o JAWS */}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
{/**
      {/* Logo /}
      <img 
        src={logo} 
        alt={logoAlt} 
        className="h-8 w-8"
      />

      {/* Título /}
      <h1 className={`${TYPOGRAPHY.pageTitle} text-negro-una font-semibold`}>
        {title}
      </h1>
 */}
      {/* Contenido adicional en la derecha */}
      {rightContent && (
        <div className="ml-auto">
          {rightContent}
        </div>
      )}
    </header>
  );
};