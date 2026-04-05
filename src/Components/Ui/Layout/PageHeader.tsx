import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // Para botones de acción, breadcrumbs, etc.
  headerExtra?: React.ReactNode; // Para contenido adicional al lado del título
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  className,
  children,
  headerExtra,
}) => {
  const { isMobile } = useBreakpoint();

  return (
    <div className={cn(
      'mb-8 w-full text-left transition-all duration-300',
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
            )}>
              {description}
            </p>
          )}
        </div>
        
        {/* Contenido adicional del header (lado derecho) */}
        {headerExtra && (
          <div className="ml-4 shrink-0">
            {headerExtra}
          </div>
        )}
      </div>

      {/* Contenido adicional (botones, breadcrumbs, etc.) */}
      {children && (
        <div className={cn(
          'flex items-center gap-4',
          'justify-start',
          description ? 'mt-4' : '',
          isMobile ? 'flex-col' : 'flex-row'
        )}>
          {children}
        </div>
      )}
    </div>
  );
};