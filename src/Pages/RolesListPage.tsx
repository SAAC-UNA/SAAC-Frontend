import React from 'react';
import { PageHeader } from '../Components/Ui/Index';

const RolesListPage: React.FC = () => {
  return (
    <div className="w-full">
      <PageHeader 
        title="Lista de Roles"
        description="Consulta y administra todos los roles del sistema"
      />
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lista de Roles
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad estará disponible próximamente.
            </p>
            <div className="text-sm text-gray-500">
              Aquí podrás ver, editar y eliminar roles existentes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesListPage;