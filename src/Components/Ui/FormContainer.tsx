import React from 'react';
import { cn } from '@/utils/ClassNames';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
  variant?: 'default' | 'full-width';
}

export const FormContainer: React.FC<FormContainerProps> = ({
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
    // Mobile: p-4, Tablet: p-5, Desktop: p-6
    return 'p-4 sm:p-5 lg:p-6';
  };

  // Función para calcular el contenedor externo
  const getOuterContainer = () => {
    if (variant === 'full-width') {
      return 'w-full px-4 py-8'; // Sin max-width para full-width
    }
    return 'max-w-7xl mx-auto px-4 py-8'; // Con max-width y centrado para default
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
          <div className={cn(
            getFormPadding(),
            'border-b border-gris-una/10'
          )}>
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
        )}

        {/* Contenido */}
        <div className={getFormPadding()}>
          {children}
        </div>
      </div>
    </div>
  );
};