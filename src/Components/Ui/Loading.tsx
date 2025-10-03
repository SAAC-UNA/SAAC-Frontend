import React from 'react';
import { cn } from '@/utils/ClassNames';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'current';
  className?: string;
  thickness?: 'thin' | 'normal' | 'thick';
  variant?: 'spinner' | 'ring' | 'bounce';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  thickness = 'normal',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-azul-una',
    secondary: 'border-rojo-una-2',
    white: 'border-white',
    gray: 'border-gray-900',
    current: 'border-current'
  };

  const thicknessClasses = {
    thin: 'border',
    normal: 'border-2',
    thick: 'border-4'
  };

  // Ring loader moderno
  if (variant === 'ring') {
    // Tamaños para el contenedor del ring
    const ringSizeClasses = {
      xs: 'w-5 h-5',
      sm: 'w-6 h-6', 
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-20 h-20'
    };

    // Colores solo para el ring (sin clases de border)
    const ringColorClasses = {
      primary: 'text-azul-una',
      secondary: 'text-rojo-una-2',
      white: 'text-white',
      gray: 'text-gray-900',
      current: 'text-current'
    };

    return (
      <div
        className={cn(
          'relative inline-block',
          ringSizeClasses[size],
          ringColorClasses[color],
          className
        )}
        role="status"
        aria-label="Cargando..."
      >
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="absolute box-border block rounded-full"
            style={{
              width: '80%',
              height: '80%',
              margin: '10%',
              border: `${thickness === 'thin' ? '2px' : thickness === 'thick' ? '4px' : '3px'} solid transparent`,
              borderTopColor: 'currentColor',
              animation: `lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
              animationDelay: `${-0.45 + index * 0.15}s`
            }}
          />
        ))}
      </div>
    );
  }

  // Bounce loader 
  if (variant === 'bounce') {
    // Tamaños para las esferas del bounce
    const bounceSizeClasses = {
      xs: 'w-2 h-2',
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-8 h-8'
    };

    // Espaciado del contenedor según el tamaño
    const bounceContainerClasses = {
      xs: 'gap-1',
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-2',
      xl: 'gap-3'
    };

    // Colores para las esferas
    const bounceColorClasses = {
      primary: 'bg-azul-una',
      secondary: 'bg-rojo-una-2',
      white: 'bg-white',
      gray: 'bg-gray-900',
      current: 'bg-current'
    };

    return (
      <div 
        className={cn(
          'flex items-center justify-center',
          bounceContainerClasses[size],
          className
        )}
        role="status"
        aria-label="Cargando..."
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full',
              bounceSizeClasses[size],
              bounceColorClasses[color]
            )}
            style={{
              animation: 'sk-bouncedelay 1.4s infinite ease-in-out both',
              animationDelay: `${-0.32 + index * 0.16}s`
            }}
          />
        ))}
      </div>
    );
  }

  // Spinner clásico (por defecto)
  return (
    <div 
      className={cn(
        'border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        thicknessClasses[thickness],
        className
      )}
      role="status"
      aria-label="Cargando..."
    />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number; // Para variant="text"
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  const baseClasses = 'bg-gris-una/20 animate-pulse';

  // Para variant="text" con múltiples líneas
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              getVariantClasses(),
              index === lines - 1 ? 'w-3/4' : 'w-full', // Última línea más corta
              'h-4'
            )}
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        getVariantClasses(),
        variant === 'text' && 'h-4',
        variant === 'rectangular' && 'h-20',
        variant === 'circular' && 'w-12 h-12',
        className
      )}
      style={{ width, height }}
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner variant="bounce" size="sm" color="secondary" />
            <p className="text-sm text-gris-una">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  );
};