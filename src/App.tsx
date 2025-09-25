import React from 'react';
import { NavigationProvider } from './Context/NavigationContext';
import { Layout } from './Components/Layout/Index';
import { CreateRoleForm } from './Components/Features/Roles/Index';

const App: React.FC = () => {
  const handleCreateRole = (roleData: any) => {
    console.log('Nuevo rol creado:', roleData);
    // Aquí integrarías con tu API o estado global
  };

  const handleCancel = () => {
    console.log('Creación cancelada');
    // Aquí podrías navegar de vuelta o limpiar estado
  };

  return (
    <NavigationProvider>
      <Layout>
        {/* Contenido principal de la aplicación */}
        <div className="w-full">
          <CreateRoleForm 
            onSubmit={handleCreateRole}
            onCancel={handleCancel}
            title="Gestión de Roles"
            description="Crea roles del sistema SAAC-UNA"
            showHeader={true}
          />
        </div>
      </Layout>
    </NavigationProvider>
  );
};

export default App;