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
          {['pf-0','pf-1','pf-2','pf-3','pf-4','pf-5'].map((id, i) => (
            <div key={id} className="pfile" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      </div>
    );
  }

  return null;
};