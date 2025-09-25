import React from 'react';
import { cn } from '@/utils/ClassNames';

interface SidebarInsetProps {
  className?: string;
  children: React.ReactNode;
}

export const SidebarInset: React.FC<SidebarInsetProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <main
      className={cn(
        'bg-blanco-una-2 relative flex w-full flex-1 flex-col min-h-screen',
        // Ajustes para diferentes variantes del sidebar
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
        'md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
        'md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};