import React, { useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { SidebarItem } from './SidebarItem';
import { navigationItems } from '@/Navigation';
import { cn } from '@/utils/ClassNames';

export const Sidebar: React.FC = () => {
  const { isCollapsed, collapseSidebar } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // En desktop, no colapsar automáticamente
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapseSidebar]);

  const logoutItem = {
    id: 'logout',
    label: 'Salir',
    icon: '🚪',
    href: '/logout'
  };

  return (
    <>
      {/* Overlay para mobile */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300',
          isCollapsed 
            ? 'opacity-0 pointer-events-none' 
            : 'opacity-100 pointer-events-auto'
        )}
        onClick={collapseSidebar}
      />
      
      {/* Sidebar Container - USANDO TUS COLORES */}
      <div className={cn(
        // Posicionamiento
        'fixed lg:sticky top-0 left-0 z-50 h-screen',
        // Dimensiones y transiciones
        'sidebar-width transition-sidebar lg:transition-none',
        // Background usando tu color rojo UNA
        'sidebar-gradient text-blanco-una',
        // Shadow
        'shadow-sidebar lg:shadow-none',
        // Estado colapsado
        isCollapsed && '-translate-x-full lg:w-0 lg:overflow-hidden'
      )}>
        
        <div className="flex flex-col h-full">
          {/* Logo Section - usando tus colores */}
          <div className="flex-shrink-0 p-6 bg-rojo-una-2/30 border-b border-white/20 backdrop-blur-sm">
            <div className="font-bold text-lg leading-tight text-center text-blanco-una">
              <div className="text-2xl mb-2">🏛️</div>
              <div>UNA</div>
              <div className="text-xs font-normal opacity-90">UNIVERSIDAD</div>
              <div className="text-xs font-normal opacity-90">NACIONAL</div>
              <div className="text-xs font-normal opacity-90">COSTA RICA</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-6 overflow-y-auto scrollbar-sidebar">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </div>
          </nav>

          {/* Logout Section */}
          <div className="flex-shrink-0 p-4 border-t border-white/20 bg-rojo-una-2/20">
            <SidebarItem item={logoutItem} />
          </div>
        </div>
      </div>
    </>
  );
};