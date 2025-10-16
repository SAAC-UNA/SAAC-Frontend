import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // Para botones de acción, breadcrumbs, etc.
  forceLeftAlign?: boolean; // Para forzar alineación a la izquierda
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  className,
  children,
  forceLeftAlign = false
}) => {
  const { isCollapsed } = useSidebar();
  const { isDesktop, isMobile } = useBreakpoint();

  // Determinar si debemos centrar el contenido
  const shouldCenterContent = !forceLeftAlign && isCollapsed && isDesktop;

  return (
    <div className={cn(
      'mb-8 transition-all duration-300',
      shouldCenterContent ? 'text-center w-full max-w-4xl' : 'text-left w-full',
      className
    )}>
      {/* Título principal */}
      <h1 className={cn(
        'font-bold text-negro-una mb-2',
        isMobile ? 'text-xl' : 'text-2xl'
      )}>
        {title}
      </h1>
      
      {/* Subtítulo opcional */}
      {subtitle && (
        <h2 className={cn(
          'font-medium text-azul-una mb-2',
          isMobile ? 'text-base' : 'text-lg'
        )}>
          {subtitle}
        </h2>
      )}

      {/* Descripción */}
      {description && (
        <p className={cn(
          'text-gris-una',
          isMobile ? 'text-sm' : 'text-base',
          children ? 'mb-4' : '' // Si hay children, dar más espacio
        )}>
          {description}
        </p>
      )}

      {/* Contenido adicional (botones, breadcrumbs, etc.) */}
      {children && (
        <div className={cn(
          'flex items-center gap-4',
          shouldCenterContent ? 'justify-center' : 'justify-start',
          isMobile ? 'flex-col' : 'flex-row'
        )}>
          {children}
        </div>
      )}
    </div>
  );
};