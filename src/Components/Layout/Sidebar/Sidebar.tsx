import React, { useState } from 'react';
import { useSidebar } from '@/Context/SidebarContext';
import IsotipoSAAC from '@/Assets/IsotipoSAAC.svg?react';
import { SidebarItem } from './SidebarItem';
import { getNavigationItems } from '@/Navigation';
import { SidebarNavProvider } from './SidebarNavProvider';
import { cn } from '@/Utils/ClassNames';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/Components/Ui/Layout/Sheet';
import { TooltipProvider } from '@/Components/Ui/Feedback/Tooltip';
import { useAuth } from '@/Context/AuthContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { UserProfileHeader } from './UserProfileHeader';

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

  // Hover: expande visualmente cuando está colapsado, sin afectar el layout del MainContent
  const [isHovered, setIsHovered] = useState(false);
  const isVisuallyExpanded = !isCollapsed || isHovered;
  const isItemCollapsed = isCollapsed && !isHovered;

  const { user } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section — altura fija para que los ítems no se muevan al colapsar */}
      <div className="flex-shrink-0 h-20 flex justify-center items-center overflow-hidden px-3">
        <a
          href="https://www.una.ac.cr/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 min-w-0"
        >
          {/* Ícono: siempre visible */}
          <IsotipoSAAC
            aria-label="Universidad Nacional de Costa Rica"
            className="flex-shrink-0 size-icon-logo cursor-pointer text-rojo-una-2"
          />

          {/* Texto: solo visible cuando está expandido */}
          <h1
            className={cn(
              `${TYPOGRAPHY.pageTitle} text-rojo-una-2 font-semibold whitespace-nowrap`,
              'transition-all duration-300 ease-in-out overflow-hidden',
              isItemCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}
          >
            {title}
          </h1>
        </a>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-15 overflow-hidden">
        <SidebarNavProvider isCollapsed={isItemCollapsed}>
          <div className="space-y-2 flex flex-col px-2">
            {getNavigationItems(user?.roles?.map(r => r.name)).map((item) => (
              <SidebarItem 
                key={item.id} 
                item={item}
                isCollapsed={isItemCollapsed}
              />
            ))}
          </div>
        </SidebarNavProvider>
      </nav>

      {/* Usuario autenticado al final del sidebar */}
      <div className={cn(
        'flex-shrink-0 h-20 flex items-center',
        isItemCollapsed ? 'px-0 justify-center' : 'px-3 justify-start'
      )}>
        <UserProfileHeader
          className={cn(
            'pr-0',
            isItemCollapsed ? 'w-auto justify-center px-0' : 'w-full justify-start px-0'
          )}
          showUserMenu={true}
          showNotifications={false}
          showInlineIdentity={isVisuallyExpanded}
          useSidebarAvatarStyle={true}
        />
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gap del sidebar en desktop — se expande con el estado visual (hover + toggle) */}
        <div
          className={cn(
            'relative bg-transparent transition-[width] duration-300 ease-in-out',
            // side === 'left'
            //   ? (isVisuallyExpanded ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-width-icon)]')
            //   : (isVisuallyExpanded ? 'w-[calc(var(--sidebar-width)+0.75rem)]' : 'w-[calc(var(--sidebar-width-icon)+0.75rem)]'),
            isVisuallyExpanded ? 'w-[calc(var(--sidebar-width)+0.75rem)]' : 'w-[calc(var(--sidebar-width-icon)+0.75rem)]',
            collapsible === 'offcanvas' && !isVisuallyExpanded && 'w-0'
          )}
        />
        
        {/* Container del sidebar */}
        <div
          className={cn(
            'fixed z-10 hidden transition-[left,right,width,top,bottom] duration-300 ease-in-out md:flex',
            'w-[var(--sidebar-width)]',
            // side === 'left' ? 'inset-y-0 left-0' : 'inset-y-3 right-3',
            side === 'left' ? 'inset-y-3 left-3' : 'inset-y-3 right-3',
            state === 'collapsed' && collapsible === 'offcanvas' && (
              side === 'left'
                ? '-left-[var(--sidebar-width)]'
                : '-right-[var(--sidebar-width)]'
            ),
            !isVisuallyExpanded && collapsible === 'icon' && 'w-[var(--sidebar-width-icon)]',
            className
          )}
        >
          <div
            className={cn(
              'bg-blanco-una-2 flex h-full w-full flex-col overflow-hidden shadow-xl/20',
              // side === 'left'
              //   ? 'rounded-l-none [border-top-right-radius:var(--radius-lg)] [border-bottom-right-radius:var(--radius-lg)]'
              //   : 'rounded-corner-lg',
              'rounded-lg',
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