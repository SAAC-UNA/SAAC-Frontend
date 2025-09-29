/**
 * RolesListPage - Página de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { RolesTable } from '../Components/Features/Roles/RolesTable';
import { PageHeader } from '../Components/Ui/Index';
import { Modal } from '../Components/Ui/Modal';
import { useRoles } from '../Hooks/UseRoles';
import type { Role } from '../Services/RoleService';

const RolesListPage: React.FC = () => {
  const { deleteRole, isLoading } = useRoles();
  
  // Estado para el modal de confirmación
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({
    isOpen: false,
    role: null
  });

  const handleEditRole = (role: Role) => {
    console.log('Editar rol:', role);
    // TODO: Navegar a página de edición
    window.location.href = `/roles/editar/${role.id}`;
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModalState({
      isOpen: true,
      role: role
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.role) return;
    
    const success = await deleteRole(deleteModalState.role.id);
    
    if (success) {
      console.log(`Rol "${deleteModalState.role.name}" eliminado exitosamente`);
      // TODO: Mostrar notificación de éxito
    }
    
    // Cerrar modal independientemente del resultado
    setDeleteModalState({ isOpen: false, role: null });
  };

  const handleCancelDelete = () => {
    setDeleteModalState({ isOpen: false, role: null });
  };

  const handleCreateRole = () => {
    window.location.href = '/roles/crear';
  };

  return (
    <>
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-6xl">
          <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
            
            {/* Header con PageHeader */}
            <div className="p-6">
              <PageHeader
                title="Lista de Roles"
                description="Visualizar y administrar todos los roles existentes en el sistema."
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Rol"
        message={`¿Está seguro de que desea eliminar el rol "${deleteModalState.role?.name}"?`}
        confirmLabel="Eliminar Rol"
        cancelLabel="Cancelar"
        confirmLoading={isLoading}
        size="md"
      />
    </>
  );
};

export default RolesListPage;
