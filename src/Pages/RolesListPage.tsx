/**
 * RolesListPage - Página de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React from 'react';
import { RolesTable } from '../Components/Features/Roles/RolesTable';
import { PageHeader } from '../Components/Ui/Index';
import type { Role } from '../Services/RoleService';

const RolesListPage: React.FC = () => {

  const handleEditRole = (role: Role) => {
    console.log('Editar rol:', role);
    // TODO: Navegar a página de edición
    window.location.href = `/roles/editar/${role.id}`;
  };

  const handleDeleteRole = (role: Role) => {
    console.log('Eliminar rol:', role);
    // TODO: Mostrar modal de confirmación mejorado
    const confirm = window.confirm(`¿Está seguro de que desea eliminar el rol "${role.name}"?`);
    if (confirm) {
      console.log('Confirma eliminación de:', role);
      // TODO: Implementar eliminación real
    }
  };

  const handleCreateRole = () => {
    window.location.href = '/roles/crear';
  };

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-6xl">
        <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
          
          {/* Header con PageHeader - Igual que CreateRoleForm */}
          <div className="p-6">
            <PageHeader
              title="Lista de Roles"
              description="Visualiza y administra todos los roles existentes en el sistema SAAC-UNA"
              className="mb-0"
              forceLeftAlign={true}
            />
          </div>

          {/* Tabla sin header interno y sin contenedor */}
          <div className="p-6 pt-0">
            <RolesTable
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
              onCreate={handleCreateRole}
              itemsPerPage={4}
              showHeader={false}
              unstyled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesListPage;
