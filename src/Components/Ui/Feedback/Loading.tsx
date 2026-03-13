import React from 'react';
import { cn } from '@/Utils/ClassNames';

interface LoadingSpinnerProps {
  className?: string;
  variant?: 'loader';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  variant = 'loader',
}) => {
  
  if (variant === 'loader') {
    return (
      <div
        className={cn('absolute inset-0 z-40 flex items-center justify-center', className)}
        role="status"
        aria-label="Cargando..."
      >
        <div className="loader-con">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="pfile" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      </div>
    );
  }

  return null;
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
            <div className="w-6 h-6 border-2 border-gris-una border-t-transparent rounded-full animate-spin" role="status" aria-label="Cargando..." />
            <p className="text-sm text-gris-una">Cargando...</p>
          </div>
        </div>
      )}
    </div>
  );
};