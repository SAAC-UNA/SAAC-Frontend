/**
 * RolesRepository - Página principal de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { RolesTable } from './Components/RolesTable';
import { PageHeader } from '@/components/Ui/Index';
import { Modal } from '@/components/Ui/Modal';
import { useRoles } from '@/hooks/UseRoles';
import type { Role } from '@/Services/RoleService';

const RolesRepository: React.FC = () => {
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
    // TODO: Navegar a página de edición
    window.location.href = `/roles/editar/${role.id}`;
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModalState({
      isOpen: true,
      role
    });
  };

  const confirmDeleteRole = async () => {
    if (deleteModalState.role) {
      try {
        const result = await deleteRole(deleteModalState.role.id);
        
        if (result) {
          setDeleteModalState({ isOpen: false, role: null });
          // TODO: Mostrar notificación de éxito
        }
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };

  const cancelDeleteRole = () => {
    setDeleteModalState({ isOpen: false, role: null });
  };

  const handleCreateRole = () => {
    window.location.href = '/roles/crear';
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Gestión de Roles"
        description="Administra los roles y permisos del sistema SAAC-UNA"
      />

      <div className="mt-6">
        <RolesTable
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          onCreate={handleCreateRole}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={cancelDeleteRole}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro de que desea eliminar el rol <strong>"{deleteModalState.role?.name}"</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cancelDeleteRole}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteRole}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesRepository;