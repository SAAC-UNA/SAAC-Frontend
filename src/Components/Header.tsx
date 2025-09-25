import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { cn } from '@/utils/ClassNames';

import menuIcon from '@/assets/Icons/list.svg';

export const Header: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  // Determinar si debemos centrar el header completamente
  const shouldCenterHeader = isCollapsed && isDesktop;

  return (
    <header className={cn(
      'sticky top-0 z-50', 
      'bg-blanco-una backdrop-blur-sm shadow-sm',
      'transition-all duration-300',
      // Ajustar ancho y posición según sidebar
      shouldCenterHeader 
        ? 'w-full' // Ancho completo cuando sidebar cerrado
        : isDesktop 
          ? 'w-[calc(100%-16rem)] ml-64' // Ancho reducido + margen cuando sidebar abierto
          : 'w-full' // Ancho completo en móvil/tablet
    )}>
      {/* Container que ahora no necesita compensar con padding */}
      <div className={cn(
        'transition-all duration-300',
        // Padding normal sin compensación
        isMobile || isTablet ? 'px-4 py-3' : 'px-8 py-4',
        shouldCenterHeader 
          ? 'flex items-center justify-center relative' // Centrado completo
          : 'flex items-center justify-between' // Layout normal
      )}>
        
        {/* Botón de menú con posicionamiento inteligente */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'btn-menu transition-all duration-300',
            'active:scale-95 focus:outline-none',
            'flex items-center justify-center',
            'w-8 h-8 rounded-md hover:bg-gris-una/10',
            shouldCenterHeader 
              ? 'absolute left-8' // Posición absoluta desde el borde izquierdo cuando centrado
              : 'relative' // Posición normal cuando sidebar abierto
          )}
          aria-label={isCollapsed ? 'Abrir menú' : 'Cerrar menú'}
        >
          <img 
            src={menuIcon}
            alt="Menú"
            className="w-5 h-5 icon-negro-una"
          />
        </button>

        {/* Título con centrado inteligente */}
        <div className={cn(
          'transition-all duration-300',
          shouldCenterHeader 
            ? 'text-center' // Centrado perfecto
            : isMobile 
              ? 'flex-1 text-center ml-4' // Centrado en móvil
              : 'flex-1 text-left ml-6' // Izquierda en desktop normal
        )}>
          <h1 className={cn(
            'font-semibold text-negro-una',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            Sistema SAAC - UNA
          </h1>
        </div>

        {/* Área de acciones (solo visible cuando no está centrado) */}
        {!shouldCenterHeader && (
          <div className="flex items-center space-x-3">
            {/* Aquí puedes agregar notificaciones, perfil, etc. */}
            <div className="w-8 h-8 rounded-full bg-gris-una/20 flex items-center justify-center">
              {/* Placeholder para avatar o notificaciones */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
