import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { ModernSidebar, SidebarTrigger, SidebarInset } from './Sidebar/Index';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div 
        className="flex min-h-screen w-full"
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '18rem',
          '--sidebar-width-icon': '3rem',
        } as React.CSSProperties}
      >
        <ModernSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-lg font-semibold">Sistema SAAC</h1>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};