import React from 'react';
import { cn } from '@/Utils/ClassNames';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'full-width' | 'extra-wide';
  title?: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void | Promise<void>;
  headerExtra?: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  // Función para calcular padding responsivo
  const getFormPadding = () => {
    return 'p-4 sm:p-6 lg:p-8';
  };

  // Función para calcular el contenedor externo
  const getOuterContainer = () => {
    return 'max-w-7xl mx-auto';
  };

  // Variante full-width: sin contenedor decorativo, solo contenido
  if (variant === 'full-width') {
    return (
      <div className={getOuterContainer()}>
        <div className={cn('relative w-full min-h-app', className)}>
          {children}
        </div>
      </div>
    );
  }

  // Variante default: con contenedor decorativo (bg, border, shadow, padding)
  return (
    <div className={getOuterContainer()}>
      <div className={cn(
        'relative w-full bg-blanco-una rounded-corner-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-app',
        className
      )}>
        <div className={getFormPadding()}>
          {children}
        </div>
      </div>
    </div>
  );
};