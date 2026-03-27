import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider } from '@/Context/SidebarContext';
import { ModernSidebar, MainContent, AppHeader, UserProfileHeader } from './Sidebar/Index';
import { PAGE_TRANSITION_VARIANTS } from '@/Constants/Animations';

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
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <ModernSidebar />
        <MainContent>
          <AppHeader rightContent={<UserProfileHeader showUserMenu={true} showNotifications={true} showInlineIdentity={true} />} />
          <div className="flex-1">
            <div className="px-4 pt-4 pb-8"
              style={{ ['--app-header-height' as any]: '64px' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  variants={PAGE_TRANSITION_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MainContent>
      </div>
    </SidebarProvider>
  );
};