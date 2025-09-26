import React from 'react';
import { PageHeader } from '../Components/Ui/Index';

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <PageHeader 
        title="Inicio"
        description="Bienvenido al Sistema SAAC-UNA"
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de navegación rápida */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Gestión de Roles</h3>
            <p className="text-gray-600">Administra los roles del sistema</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Configuración</h3>
            <p className="text-gray-600">Configura el sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;