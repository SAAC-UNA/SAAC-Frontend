import React, { useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { SidebarItem } from './SidebarItem';
import { navigationItems } from '@/Navigation';
import { cn } from '@/utils/ClassNames';

import logOutIcon from '@/assets/Icons/logout.svg';

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
    icon: logOutIcon,
    href: '/logout'
  };

  return (
    <>
      {/* Overlay para teléfono */}
      <div 
        className={cn(
          'fixed inset-0 bg-blanco-una z-40 lg:hidden transition-opacity duration-300',
          isCollapsed 
            ? 'opacity-0 pointer-events-none' 
            : 'opacity-100 pointer-events-auto'
        )}
        onClick={collapseSidebar}
      />
      
      {/* Sidebar Container */}
      <div className={cn(
        // Posicionamiento
        'fixed lg:sticky top-0 left-0 z-50 h-screen',
        // Dimensiones y transiciones
        'sidebar-width transition-sidebar lg:transition-none',
        // Background uniforme - sin gradiente
        'bg-rojo-una-2 text-blanco-una',
        // Shadow
        'shadow-sidebar lg:shadow-none',
        // Estado colapsado
        isCollapsed && '-translate-x-full lg:w-0 lg:overflow-hidden'
      )}>
        
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
                  className="h-10 md:h-12 w-auto object-contain cursor-pointer"
                />
              </a>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-6">
            <div className="space-y-2 high-2 flex flex-col justify-evenly">
              {navigationItems.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </div>
          </nav>

          {/* Logout Section */}
          <div className="flex-shrink-0 p-4">
            <div className="flex justify-center">
              <SidebarItem item={logoutItem} centered />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};