import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { ModernSidebarItem } from './ModernSidebarItem';
import { navigationItems } from '@/Navigation';
import { cn } from '@/utils/ClassNames';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/Ui/Sheet';
import { TooltipProvider } from '@/components/Ui/Tooltip';

interface SidebarProps {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
}

export const ModernSidebar: React.FC<SidebarProps> = ({ 
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className 
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  const logoutItem = {
    id: 'logout',
    label: 'Salir',
    icon: 'system-icon:logout',
    href: '/logout'
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex-shrink-0 p-6">
        <div className="flex justify-center items-center">
          <a 
            href="https://www.una.ac.cr/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img 
              src="/Images/UNAHorizontal-Blanco.png"
              alt="Universidad Nacional de Costa Rica"
              className={cn(
                "w-auto object-contain cursor-pointer transition-all duration-200",
                state === 'collapsed' && !isMobile 
                  ? "h-8" 
                  : "h-10 md:h-12"
              )}
            />
          </a>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-hidden">
        <div className="space-y-2 flex flex-col">
          {navigationItems.map((item) => (
            <ModernSidebarItem 
              key={item.id} 
              item={item}
              isCollapsed={state === 'collapsed' && !isMobile}
            />
          ))}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-center">
          <ModernSidebarItem 
            item={logoutItem} 
            centered 
            isCollapsed={state === 'collapsed' && !isMobile}
          />
        </div>
      </div>
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
          style={{
            '--sidebar-width-mobile': '18rem',
          } as React.CSSProperties}
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
            'relative bg-transparent transition-[width] duration-200 ease-linear',
            'w-[var(--sidebar-width)]',
            'group-data-[state=collapsed]:w-[var(--sidebar-width-icon)]',
            collapsible === 'offcanvas' && 'group-data-[state=collapsed]:w-0'
          )}
        />
        
        {/* Container del sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 z-10 hidden h-screen transition-[left,right,width] duration-200 ease-linear md:flex',
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
              : side === 'left' 
                ? 'border-r' 
                : 'border-l',
            className
          )}
        >
          <div
            className={cn(
              'bg-rojo-una-2 flex h-full w-full flex-col overflow-hidden',
              variant === 'floating' && 'rounded-lg border shadow-sm'
            )}
          >
            {sidebarContent}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};