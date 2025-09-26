import React from 'react';
import { PageHeader } from '../Components/Ui/Index';

const UsersPage: React.FC = () => {
  return (
    <div className="w-full">
      <PageHeader 
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema SAAC-UNA"
      />
      <div className="p-6">
        <div className="bg-blanco-una rounded-lg shadow-sm border p-6">
          <p className="text-gris-una">
            Esta página estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;