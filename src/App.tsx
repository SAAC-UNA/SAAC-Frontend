import React from 'react';
import { SidebarProvider, useSidebar } from './Context/SidebarContext';
import { NavigationProvider } from './Context/NavigationContext';
import { Sidebar } from './Components/Layout/Sidebar/Index';
import { Header } from './Components/Header';
import { CreateRoleForm } from './Components/Features/Roles/Index';
import { ResponsiveLayout } from './Components/Layout/ResponsiveLayout';
import { useBreakpoint } from '@/hooks/UseBreakpoint';

const MainContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { isDesktop } = useBreakpoint();
  
  const handleCreateRole = (roleData: any) => {
    console.log('Nuevo rol creado:', roleData);
    // Aquí integrarías con tu API o estado global
  };

  const handleCancel = () => {
    console.log('Creación cancelada');
    // Aquí podrías navegar de vuelta o limpiar estado
  };

  // Determinar si debemos centrar el contenido
  const shouldCenterContent = isCollapsed && isDesktop;

  return (
    <>
      {/* Header que se extiende por toda la pantalla */}
      <Header />
      
      {/* Layout principal con sidebar y contenido */}
      <div className="flex flex-1">
        <Sidebar />
        
        {/* Área de contenido */}
        <div className="flex-1 flex flex-col">
          <ResponsiveLayout>
            {/* Título de la página con centrado inteligente */}
            <div className={`mb-8 transition-all duration-300 ${
              shouldCenterContent ? 'text-center w-full max-w-4xl' : 'text-left w-full'
            }`}>
              <h1 className="text-2xl font-bold text-negro-una mb-2">
                Gestión de Roles
              </h1>
              <p className="text-gris-una">
                Crea de roles del sistema SAAC-UNA
              </p>
            </div>

            {/* Formulario de creación de rol */}
            <div className={`w-full transition-all duration-300 ${
              shouldCenterContent ? 'flex justify-center' : 'flex justify-start'
            }`}>
              <CreateRoleForm 
                onSubmit={handleCreateRole}
                onCancel={handleCancel}
              />
            </div>
          </ResponsiveLayout>
        </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <NavigationProvider>
        <div className="min-h-screen bg-blanco-una-2 flex flex-col">
          {/* El MainContent ahora controla toda la estructura */}
          <MainContent />
        </div>
      </NavigationProvider>
    </SidebarProvider>
  );
};

export default App;