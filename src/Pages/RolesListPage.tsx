import React from 'react';
import { PageHeader } from '../Components/Ui/Index';
import { useModuleInfo } from '../Hooks/UseModuleInfo';

const RolesListPage: React.FC = () => {
  const { title, description } = useModuleInfo('roles', 'list');
  
  return (
    <div className="w-full">
      <PageHeader 
        title={title}
        description={description}
      />
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lista de Roles
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesListPage;