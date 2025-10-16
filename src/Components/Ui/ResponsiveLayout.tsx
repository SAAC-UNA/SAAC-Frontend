import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { cn } from '@/Utils/ClassNames';

/**
 * COMPONENTE WRAPPER PARA CONTENIDO RESPONSIVE DEL SIDEBAR

 * Aplica lógica responsive específica usando
 * la información proporcionada por useBreakpoint.
 * 
 * - Ajusta padding dinámicamente según dispositivo
 * - Controla el ancho máximo del contenido
 * - Maneja centrado inteligente cuando el sidebar está colapsado
 * - Proporciona transiciones suaves entre estados
 * 
 * - Móvil: Padding reducido, sin restricciones de ancho
 * - Tablet: Padding intermedio, ajustes moderados
 * - Desktop: Padding amplio, control de ancho máximo
 * - Pantallas grandes: Centrado y restricciones adicionales
 */

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className
}) => {
  const { isCollapsed } = useSidebar();
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useBreakpoint();

  // Calcular si debemos usar centrado completo
  const shouldCenterContent = isCollapsed && isDesktop;
  
  // Calcular padding dinámico basado en el tamaño de pantalla
  const getPaddingClasses = () => {
    if (isMobile) {
      return isCollapsed ? 'px-4 py-4' : 'px-3 py-3';
    }
    
    if (isTablet) {
      return isCollapsed ? 'px-6 py-6' : 'px-4 py-4';
    }
    
    if (isDesktop) {
      if (isLargeScreen) {
        return isCollapsed ? 'px-20 py-6' : 'px-16 py-6';
      }
      return isCollapsed ? 'px-16 py-4' : 'px-12 py-4';
    }
    
    return 'px-6 py-4'; // fallback
  };

  // Calcular ancho máximo para el contenido
  const getMaxWidth = () => {
    if (shouldCenterContent) {
      if (isLargeScreen) return 'max-w-7xl'; // Pantallas grandes
      return 'max-w-6xl'; // Desktop normal
    }
    return 'max-w-none'; // Sin restricción cuando sidebar abierto
  };

  return (
    <div className={cn(
      'flex-1 flex flex-col transition-all duration-300',
      className
    )}>
      {/* Container principal con padding responsive */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        getPaddingClasses()
      )}>
        {/* Container de contenido con centrado inteligente */}
        <div className={cn(
          'h-full transition-all duration-300',
          shouldCenterContent ? [
            'flex flex-col items-center',
            getMaxWidth(),
            'mx-auto'
          ] : 'w-full'
        )}>
          {children}
        </div>
      </div>
    </div>
  );
};