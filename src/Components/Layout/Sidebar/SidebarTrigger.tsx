import React from 'react';
import hamburgerIcon from '@/assets/icons/list.svg'; // Asegúrate de tener este ícono en tu proyecto
import { Button } from '@/components/Ui/Button';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/utils/ClassNames';

interface SidebarTriggerProps {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ 
  className, 
  onClick,
  ...props 
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <img src={hamburgerIcon} alt="Toggle Sidebar" className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};