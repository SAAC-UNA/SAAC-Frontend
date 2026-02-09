import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
  variant?: 'default' | 'full-width' | 'extra-wide';
  headerExtra?: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  description,
  showHeader = true,
  className = '',
  variant = 'default',
  headerExtra
}) => {
  const { isMobile } = useBreakpoint();

  // Función para calcular padding responsivo
  const getFormPadding = () => {
    // Padding interno consistente para todos los casos
    return 'p-4 sm:p-6 lg:p-8';
  };

  // Función para calcular el contenedor externo
  const getOuterContainer = () => {
    // Ancho máximo consistente, sin padding extra
    return 'max-w-7xl mx-auto';
  };

  // Función helper para renderizar el header consistentemente
  const renderHeader = () => {
    if (!title) return null;

    return (
      <>
        <div className={getFormPadding()}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className={cn(
                'font-bold text-negro-una mb-2',
                isMobile ? 'text-xl' : 'text-2xl'
              )}>
                {title}
              </h1>
              {description && (
                <p className={cn(
                  'text-gris-una whitespace-pre-line',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {description}
                </p>
              )}
            </div>
            
            {/* Contenido adicional del header */}
            {headerExtra && (
              <div className="ml-4 flex-shrink-0">
                {headerExtra}
              </div>
            )}
          </div>
        </div>
        <hr className="border-0 border-t border-gris-una/20 mx-6" />
      </>
    );
  };

  // Si no se muestra header y es full-width, retornar solo el contenido
  if (!showHeader && variant === 'full-width') {
    return (
      <div className={getOuterContainer()}>
        <div className={cn(`w-full min-h-app`, className)}>{children}</div>
      </div>
    );
  }

  // Si no se muestra header pero sí el contenedor
  if (!showHeader) {
    return (
      <div className={getOuterContainer()}>
        <div className={cn(
          'w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300', 'min-h-app',
          className
          )}
        >
          {/* Header */}
          {renderHeader()}
          <div className={getFormPadding()}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getOuterContainer()}>
      <div className={cn(
        'w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300', 'min-h-app',
        className
      )}>
        {/* Header */}
        {renderHeader()}

        {/* Contenido */}
        <div className={getFormPadding()}>
          {children}
        </div>
      </div>
    </div>
  );
};