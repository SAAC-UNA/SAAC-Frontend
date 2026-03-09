import React from 'react';
import { cn } from '@/Utils/ClassNames';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'current' | 'loading';
  className?: string;
  thickness?: 'thin' | 'normal' | 'thick';
  variant?: 'spinner' | 'bounce' | 'uploading' | 'paging';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'loading',
  className,
  thickness = 'normal',
  variant = 'bounce'
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
    current: 'border-current',
    loading: 'border-gris-una'
  };

  const thicknessClasses = {
    thin: 'border',
    normal: 'border-2',
    thick: 'border-4'
  };

  // Paging loader - Animación de libro/documento girando (estilos en index.css)
  // Se posiciona como overlay fijo centrado en pantalla, independientemente del contenedor padre
  if (variant === 'paging') {
    return (
      <div className={cn('absolute inset-0 z-40 flex items-center justify-center pt-32', className)} role="status" aria-label="Cargando...">
        <div className="saac-loader-paging" />
      </div>
    );
  }

  // Uploading loader - Animación de carga de archivos
  if (variant === 'uploading') {
    const uploadingSizeMap = {
      xs: { container: 'w-12 h-2', ball: 'w-2 h-2', shadow: '4px' },
      sm: { container: 'w-16 h-3', ball: 'w-3 h-3', shadow: '6px' },
      md: { container: 'w-20 h-4', ball: 'w-4 h-4', shadow: '8px' },
      lg: { container: 'w-24 h-5', ball: 'w-5 h-5', shadow: '10px' },
      xl: { container: 'w-32 h-6', ball: 'w-6 h-6', shadow: '12px' }
    };

    const sizeConfig = uploadingSizeMap[size];

    return (
      <div 
        className={cn('relative', sizeConfig.container, className)}
        role="status"
        aria-label="Subiendo..."
      >
        <style>{`
          @keyframes rotateUploadLoader {
            0%, 10% { transform: rotate(-153deg); }
            90%, 100% { transform: rotate(0deg); }
          }
          @keyframes ballMoveUploadX {
            0%, 10% { transform: translateX(0); }
            90%, 100% { transform: translateX(${sizeConfig.shadow}); }
          }
        `}</style>
        <div
          className={cn(
            'absolute rounded-full',
            sizeConfig.ball,
            colorClasses[color].replace('border-', 'bg-')
          )}
          style={{
            left: 0,
            top: 0,
            boxShadow: `${sizeConfig.shadow} 0 currentColor`,
            animation: 'ballMoveUploadX 1s linear infinite'
          }}
        />
        <div
          className={cn(
            'absolute rounded-full',
            sizeConfig.ball,
            colorClasses[color].replace('border-', 'bg-')
          )}
          style={{
            left: 0,
            top: 0,
            transformOrigin: `calc(${sizeConfig.shadow} * 2.5) 0`,
            animation: 'rotateUploadLoader 1s linear infinite'
          }}
        />
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
      current: 'bg-current',
      loading: 'bg-gris-una' // Usa la variable CSS del sistema de iconos
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
            <LoadingSpinner size="sm" />
            <p className="text-sm text-gris-una">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  );
};