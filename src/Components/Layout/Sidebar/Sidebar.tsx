import React from 'react';
import { useSidebar } from '@/Context/SidebarContext';
import { SidebarItem } from './SidebarItem';
import { getNavigationItems } from '@/Navigation';
import { cn } from '@/Utils/ClassNames';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/Components/Ui/Layout/Sheet';
import { TooltipProvider } from '@/Components/Ui/Feedback/Tooltip';
import { useAuth } from '@/Context/AuthContext';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface SidebarProps {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
  title?: string;
}

export const ModernSidebar: React.FC<SidebarProps> = ({ 
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  title = "SAAC",
  className 
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

  const { user } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section — altura fija para que los ítems no se muevan al colapsar */}
      {/** h-20 para cuando se use imagen */}
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
          <h1 className={`${TYPOGRAPHY.pageTitle} text-blanco-una font-semibold`}>
              {title}
          </h1>
          {/**
          <img
            src="/Images/UNAHorizontal-Blanco.png"
            alt="Universidad Nacional de Costa Rica"
            className="w-auto h-10 object-contain cursor-pointer"
          /> 
          */}
        </a>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-2 overflow-hidden">
        <div className="space-y-2 flex flex-col">
          {getNavigationItems(user?.roles?.map(r => r.name)).map((item) => (
            <SidebarItem 
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
        {/* Gap del sidebar en desktop — mantiene espacio según anclaje y estado */}
        <div
          className={cn(
            'relative bg-transparent transition-[width] duration-300 ease-in-out',
            side === 'left' ? 'w-[var(--sidebar-width)]' : 'w-[calc(var(--sidebar-width)+0.75rem)]',
            side === 'left'
              ? 'group-data-[state=collapsed]:w-[var(--sidebar-width-icon)]'
              : 'group-data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)+0.75rem)]',
            collapsible === 'offcanvas' && 'group-data-[state=collapsed]:w-0'
          )}
        />
        
        {/* Container del sidebar */}
        <div
          className={cn(
            'fixed z-10 hidden transition-[left,right,width,top,bottom] duration-300 ease-in-out md:flex',
            'w-[var(--sidebar-width)]',
            side === 'left' ? 'inset-y-0 left-0' : 'inset-y-3 right-3',
            state === 'collapsed' && collapsible === 'offcanvas' && (
              side === 'left'
                ? '-left-[var(--sidebar-width)]'
                : '-right-[var(--sidebar-width)]'
            ),
            state === 'collapsed' && collapsible === 'icon' && 'w-[var(--sidebar-width-icon)]',
            className
          )}
        >
          <div
            className={cn(
              'bg-rojo-una-2 flex h-full w-full flex-col overflow-hidden',
              side === 'left' ? 'rounded-l-none rounded-r-3xl' : 'rounded-corner',
              {/** shadow-2xl */}
            )}
          >
            {sidebarContent}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};