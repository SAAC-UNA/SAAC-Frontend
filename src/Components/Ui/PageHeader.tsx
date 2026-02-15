import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // Para botones de acción, breadcrumbs, etc.
  headerExtra?: React.ReactNode; // Para contenido adicional al lado del título
  forceLeftAlign?: boolean; // Para forzar alineación a la izquierda
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  className,
  children,
  headerExtra,
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
      {/* Contenedor flex para título y headerExtra */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Título principal */}
          <h1 className={cn(
            'font-poppins font-bold text-negro-una mb-2',
            TYPOGRAPHY.pageTitle
          )}>
            {title}
          </h1>
          
          {/* Subtítulo opcional */}
          {subtitle && (
            <h2 className={cn(
              'font-poppins font-medium text-azul-una mb-2',
              TYPOGRAPHY.pageSubtitle
            )}>
              {subtitle}
            </h2>
          )}

          {/* Descripción */}
          {description && (
            <p className={cn(
              'font-poppins text-gris-una',
              TYPOGRAPHY.pageSubtitle,
              children ? 'mb-4' : '' // Si hay children, dar más espacio
            )}>
              {description}
            </p>
          )}
        </div>
        
        {/* Contenido adicional del header (lado derecho) */}
        {headerExtra && (
          <div className="ml-4 flex-shrink-0">
            {headerExtra}
          </div>
        )}
      </div>

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