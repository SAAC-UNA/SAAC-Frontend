/**
 * Sheet - Componente sidebar para mobile
 *
 * Componentes:
 * - Sheet: Contenedor principal con gestión de estado
 * - SheetContent: Panel deslizante con el contenido
 * - SheetHeader: Header opcional con título y descripción
 */

import React, { useEffect } from 'react';
import { cn } from '@/utils/ClassNames';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps {
  side?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop con efecto blur */}
      <div 
        className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </>
  );
}

export function SheetContent({ 
  side = 'left', 
  className, 
  children, 
  style 
}: SheetContentProps) {
  return (
    <div
      className={cn(
        'fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out',
        'inset-y-0 h-full w-3/4',
        side === 'left' ? 'left-0 animate-in slide-in-from-left' : 'right-0 animate-in slide-in-from-right',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function SheetHeader({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
      {children}
    </div>
  );
}

export function SheetTitle({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode; 
}) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  );
}

export function SheetDescription({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode; 
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}