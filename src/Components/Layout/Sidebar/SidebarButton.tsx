import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { SIDEBAR_ITEM } from '@/Constants/Components';

interface SidebarButtonProps {
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Botón del sidebar
 * Responsabilidad: forma, altura fija, colores activo/inactivo y curvas decorativas.
 * NO conoce tipografía ni tamaño de ícono — eso lo maneja cada hijo.
 */
export const SidebarButton: React.FC<SidebarButtonProps> = ({
  isActive,
  isCollapsed,
  onClick,
  children,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group/btn flex items-center text-left relative z-10',
        'rounded-l-sidebar-item font-medium cursor-pointer mb-2',
        // Sin transition-all: el cambio de padding ocurre cuando el sidebar ya terminó de cerrar
        // Las transiciones visuales (colores hover) las manejan los hijos
        'transition-colors duration-200',
        // Cuando colapsado: ancho explícito = sidebar-width-icon para garantizar centrado del ícono
        // sin depender de w-full (que puede no resolver correctamente dentro del TooltipTrigger)
        isCollapsed
          ? 'w-[var(--sidebar-width-icon)] h-sidebar-item px-2 justify-center'
          : `w-full ${SIDEBAR_ITEM.button} justify-start`,
        isActive
          ? 'text-rojo-una-2 font-semibold'
          : 'text-blanco-una-2 hover:bg-rojo-una-2',
        className,
      )}
    >
      {/* Fondo activo con curvas — cuando colapsado, el overlay arranca en left-1 para dar inset visual
          sin dejar hueco en el lado derecho (el botón sigue siendo w-full) */}
      {isActive && (
        <div className={cn(
          'absolute rounded-l-sidebar-item bg-blanco-una-2 pointer-events-none',
          isCollapsed ? 'inset-y-0 left-1 right-0' : 'inset-0',
        )}>
          <div
            className="absolute right-0 rounded-corner-full"
            style={{
              top: 'calc(-1 * var(--radius-sidebar-item))',
              width: 'var(--radius-sidebar-item)',
              height: 'var(--radius-sidebar-item)',
              boxShadow: 'calc(var(--radius-sidebar-item) / 2) calc(var(--radius-sidebar-item) / 2) 0 #f8f9fa',
            } as React.CSSProperties}
          />
          <div
            className="absolute right-0 rounded-corner-full"
            style={{
              bottom: 'calc(-1 * var(--radius-sidebar-item))',
              width: 'var(--radius-sidebar-item)',
              height: 'var(--radius-sidebar-item)',
              boxShadow: 'calc(var(--radius-sidebar-item) / 2) calc(-1 * var(--radius-sidebar-item) / 2) 0 #f8f9fa',
            } as React.CSSProperties}
          />
        </div>
      )}

      {children}
    </button>
  );
};
