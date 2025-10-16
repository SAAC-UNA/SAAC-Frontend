import React from 'react';
import { cn } from '@/Utils/ClassNames';

/**
 * CONTENEDOR PRINCIPAL DE LA APLICACIÓN
 * ====================================
 * 
 * Este componente representa el área principal de contenido de la aplicación,
 * todo lo que NO es el sidebar. Incluye el header y el área de contenido.
 * 
 * RESPONSABILIDADES:
 * - Definir el color de fondo principal (bg-blanco-una-2)
 * - Establecer el layout del contenido principal
 * - Manejar transiciones y estados responsive
 * - Adaptarse al estado del sidebar (expandido/colapsado)
 * 
 * NOMBRE DESCRIPTIVO: MainContent refleja claramente que este es el
 * contenedor del contenido principal, no una parte del sidebar.
 */

interface MainContentProps {
  className?: string;
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <main
      className={cn(
        'bg-blanco-una-2 relative flex w-full flex-1 flex-col min-h-screen transition-all duration-200 ease-in-out',
        // Ajustes para diferentes variantes del sidebar
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
        'md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
        'md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

// Alias para mantener compatibilidad durante la transición
export const SidebarInset = MainContent;