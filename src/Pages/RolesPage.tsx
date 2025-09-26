import React from 'react';
import { CreateRoleForm } from '../Components/Features/Roles/Index';

const RolesCreatePage: React.FC = () => {
  const handleCreateRole = (roleData: any) => {
    console.log('Nuevo rol creado:', roleData);
    // Aquí integrarías con tu API o estado global
  };

  const handleCancel = () => {
    console.log('Creación cancelada');
    // Aquí podrías navegar de vuelta o limpiar estado
  };

  return (
    <div className="w-full flex justify-center">
      <CreateRoleForm 
        onSubmit={handleCreateRole}
        onCancel={handleCancel}
        title="Crear Nuevo Rol"
        description="Crea roles del sistema SAAC-UNA"
        showHeader={true}
      />
    </div>
  );
};

export default RolesCreatePage;