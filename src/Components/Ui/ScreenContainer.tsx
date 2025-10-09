import React from 'react';
import { cn } from '@/utils/ClassNames';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
  variant?: 'default' | 'full-width';
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  description,
  showHeader = true,
  className = '',
  variant = 'default'
}) => {
  const { isMobile } = useBreakpoint();

  // Función para calcular padding responsivo
  const getFormPadding = () => {
    // Mobile: p-2, Tablet: p-3, Desktop: p-4 (reducido para subir el contenido)
    return 'p-2 sm:p-3 lg:p-4';
  };

  // Función para calcular el contenedor externo
  const getOuterContainer = () => {
    if (variant === 'full-width') {
      return 'w-full px-4 pt-2 pb-8'; // Menos padding arriba para full-width
    }
    return 'max-w-7xl mx-auto px-4 pt-2 pb-8'; // Menos padding arriba, más abajo
  };

  // Si no se muestra header y es full-width, retornar solo el contenido
  if (!showHeader && variant === 'full-width') {
    return (
      <div className={getOuterContainer()}>
        <div className={`w-full ${className}`}>{children}</div>
      </div>
    );
  }

  // Si no se muestra header pero sí el contenedor
  if (!showHeader) {
    return (
      <div className={getOuterContainer()}>
        <div className={cn(
          'w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit',
          className
        )}>
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
        'w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit',
        className
      )}>
        {/* Header */}
        {title && (
          <>
            <div className={getFormPadding()}>
              <h1 className={cn(
                'font-bold text-negro-una mb-2',
                isMobile ? 'text-xl' : 'text-2xl'
              )}>
                {title}
              </h1>
              {description && (
                <p className={cn(
                  'text-gris-una',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {description}
                </p>
              )}
            </div>
            {/* Línea divisoria con márgenes */}
            <hr className="border-0 border-t border-gris-una/20 mx-6" />
          </>
        )}

        {/* Contenido */}
        <div className={getFormPadding()}>
          {children}
        </div>
      </div>
    </div>
  );
};