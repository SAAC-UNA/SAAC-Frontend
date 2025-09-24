import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/utils/ClassNames';
import menuIcon from '@/assets/Icons/menu.svg';

export const Header: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full',
      'bg-blanco-una backdrop-blur-sm shadow-sm'
    )}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Botón de menú */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'transition-all duration-200',
            'active:scale-95',
            'focus:outline-none',
            // Visible en móvil siempre, en desktop solo cuando el sidebar está colapsado
            'lg:opacity-100'
          )}
          aria-label={isCollapsed ? 'Abrir menú' : 'Cerrar menú'}
        >
          <img 
            src={menuIcon}
            alt="Menú"
            className={cn(
              "w-6 h-6 transition-all duration-200 icon-rojo-una-2 bg-transparent",
            )}
          />
        </button>

        {/* Título de la página */}
        <div className="flex-1 text-center lg:text-left lg:ml-6">
          <h1 className="text-lg sm:text-xl font-semibold text-negro-una">
            Sistema SAAC - UNA
          </h1>
        </div>

        {/* Espacio para futuras acciones */}
        <div className="w-10 h-10 flex items-center justify-center">
          {/* Aquí podrías agregar notificaciones, perfil, etc. */}
        </div>
      </div>
    </header>
  );
};
