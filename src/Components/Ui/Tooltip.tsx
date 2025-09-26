import React, { useState } from 'react';
import { cn } from '@/utils/ClassNames';

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
  return <div>{children}</div>;
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ asChild = false, children }: TooltipTriggerProps) {
  const { setOpen } = React.useContext(TooltipContext);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  if (asChild && React.isValidElement(children)) {
    // Para el caso asChild, simplemente envolvemos el children
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      className={cn(
        'absolute z-50 px-2 py-1 text-xs bg-gray-900 text-blanco-una rounded shadow-lg whitespace-nowrap',
        sideClasses[side],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}