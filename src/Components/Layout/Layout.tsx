import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { ModernSidebar, MainContent, AppHeader } from './Sidebar/Index';
import { ToastContainer } from '@/Components/Ui/Toast';

/**
 * COMPONENTE DE LAYOUT BASE
 * 
 * Define la estructura fundamental e inmutable de la aplicación.
 * 
 * RESPONSABILIDADES:
 * - Configurar la estructura básica (sidebar + contenido principal)
 * - Proveer el contexto del sidebar
 * - Definir el header con logo y título
 * - Establecer variables CSS para dimensiones del sidebar
 * 
 * COMPONENTES PRINCIPALES:
 * - ModernSidebar: Barra lateral de navegación
 * - MainContent: Área principal de contenido (antes SidebarInset)
 * - SidebarTrigger: Botón para colapsar/expandir sidebar
 * 
 * NOTA: Para lógica responsive específica, usar ResponsiveLayout
 * de @/components/Ui/ResponsiveLayout como wrapper interno en páginas que lo requieran.
 * 
 * CAMBIO DE NOMENCLATURA: MainContent reemplaza a SidebarInset para mayor claridad,
 * ya que maneja TODO el contenido principal, no solo una "inserción" del sidebar.
 */

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
        <MainContent>
          <AppHeader />
          <div className="flex-1 flex justify-center items-start">
            <div className="container mx-auto px-4 py-8 w-full flex justify-center">
              {children}
            </div>
          </div>
        </MainContent>
      </div>
      
      {/* Container de toasts */}
      <ToastContainer />
    </SidebarProvider>
  );
};