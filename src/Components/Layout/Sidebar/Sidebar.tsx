import React from 'react';
import { useSidebar } from '@/Context/SidebarContext';
import { ModernSidebarItem } from './SidebarItem';
import { getNavigationItems } from '@/Navigation';
import { cn } from '@/Utils/ClassNames';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/Components/Ui/Sheet';
import { TooltipProvider } from '@/Components/Ui/Tooltip';
import { useAuth } from '@/Context/AuthContext';

interface SidebarProps {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
}

export const ModernSidebar: React.FC<SidebarProps> = ({ 
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  className 
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

  const { user } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section — altura fija para que los ítems no se muevan al colapsar */}
      <div className="flex-shrink-0 h-20 flex justify-center items-center overflow-hidden">
        <a
          href="https://www.una.ac.cr/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'transition-opacity duration-300 ease-in-out',
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <img
            src="/Images/UNAHorizontal-Blanco.png"
            alt="Universidad Nacional de Costa Rica"
            className="w-auto h-10 object-contain cursor-pointer"
          />
        </a>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-hidden">
        <div className="space-y-2 flex flex-col">
          {getNavigationItems(user?.roles?.map(r => r.name)).map((item) => (
            <ModernSidebarItem 
              key={item.id} 
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>
    </div>
  );

  if (collapsible === 'none') {
    return (
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            'bg-rojo-una-2 text-blanco-una flex h-full flex-col overflow-hidden',
            'w-[var(--sidebar-width)]',
            className
          )}
        >
          {sidebarContent}
        </div>
      </TooltipProvider>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="bg-rojo-una-2 text-blanco-una w-[var(--sidebar-width-mobile)] p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Navegación lateral del sistema SAAC.</SheetDescription>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="group peer text-blanco-una hidden md:block"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
      >
        {/* Gap del sidebar en desktop */}
        <div
          className={cn(
            'relative bg-transparent transition-[width] duration-300 ease-in-out',
            'w-[var(--sidebar-width)]',
            'group-data-[state=collapsed]:w-[var(--sidebar-width-icon)]',
            collapsible === 'offcanvas' && 'group-data-[state=collapsed]:w-0'
          )}
        />
        
        {/* Container del sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 z-10 hidden h-screen transition-[left,right,width] duration-300 ease-in-out md:flex',
            'w-[var(--sidebar-width)]',
            side === 'left'
              ? 'left-0'
              : 'right-0',
            state === 'collapsed' && collapsible === 'offcanvas' && (
              side === 'left' 
                ? '-left-[var(--sidebar-width)]'
                : '-right-[var(--sidebar-width)]'
            ),
            state === 'collapsed' && collapsible === 'icon' && 'w-[var(--sidebar-width-icon)]',
            variant === 'floating' || variant === 'inset' 
              ? 'p-2'
              : '',
            className
          )}
        >
          <div
            className={cn(
              'bg-rojo-una-2 flex h-full w-full flex-col overflow-hidden',
              variant === 'floating' && 'rounded-lg shadow-sm'
            )}
          >
            {sidebarContent}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};