import React from 'react';
import { PanelLeft } from 'lucide-react';
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
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};