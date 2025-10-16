import React, { useState } from 'react';
import { cn } from '@/Utils/ClassNames';

interface TooltipProviderProps {
  delayDuration?: number;
  children: React.ReactNode;
}

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  hidden?: boolean;
  className?: string;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <div className="tooltip-provider">
      {children}
    </div>
  );
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const handleSetOpen = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <TooltipContext.Provider value={{ open, setOpen: handleSetOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ asChild = false, children }: TooltipTriggerProps) {
  const { setOpen } = React.useContext(TooltipContext);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Crear nuevo timeout con menos delay para mejor responsividad
    timeoutRef.current = setTimeout(() => setOpen(true), 100);
  };

  const handleMouseLeave = () => {
    // Limpiar timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Ocultar inmediatamente
    setOpen(false);
  };

  const handleFocus = () => setOpen(true);
  const handleBlur = () => setOpen(false);

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (asChild && React.isValidElement(children)) {
    // Para el caso asChild, clonamos el elemento y agregamos los event handlers
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    } as any);
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </div>
  );
}

export function TooltipContent({ 
  side = 'right', 
  align = 'center', 
  hidden = false, 
  className, 
  children 
}: TooltipContentProps) {
  const { open } = React.useContext(TooltipContext);

  if (hidden || !open) return null;

  const sideClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  const alignClasses = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div
      data-tooltip-content
      className={cn(
        'absolute z-50 px-3 py-2 text-xs font-medium text-white rounded-lg shadow-lg whitespace-nowrap',
        'bg-gray-900/70 backdrop-blur-md border border-gray-700/30',
        'transition-opacity duration-300 ease-in-out',
        'font-poppins',
        sideClasses[side],
        alignClasses[align],
        className
      )}
      role="tooltip"
    >
      {children}
    </div>
  );
}