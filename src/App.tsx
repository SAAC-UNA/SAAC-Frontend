import React from 'react';
import { SidebarProvider } from './Context/SidebarContext';
import { NavigationProvider } from './Context/NavigationContext';
import { Sidebar } from './Components/Layout/Sidebar/Index';
import { Header } from './Components/Header';
import { useSidebar } from './Context/SidebarContext';
import { cn } from '@/utils/ClassNames';

const AppContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-blanco-una flex">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        // Ajustar el margen según el estado del sidebar
        !isCollapsed ? "lg:ml-0" : "lg:ml-0"
      )}>
        {/* Header con botón de menú */}
        <Header />
        {/* Contenido principal */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold">Contenido Principal</h1>
          <p className="mt-4 text-gris-una">
            {isCollapsed 
              ? "El sidebar está oculto. Usa el botón de menú para mostrarlo." 
              : "El sidebar está visible. El contenido se ajusta automáticamente."
            }
          </p>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </SidebarProvider>
  );
};

export default App;