/**
 * RolesRepository - Página principal de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { RolesTable } from './Components/RolesTable';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';
import { PermissionsModal } from '@/Components/Ui/PermissionsRoleModal';
import { useRoles } from '@/Hooks/UseRoles';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import type { Role } from '@/Services/RoleService';

const RolesRepository: React.FC = () => {
  const { deleteRole } = useRoles();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.roles;
  
  // Estado para el modal de confirmación de eliminación
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({
    isOpen: false,
    role: null
  });

  // Estado para el modal de permisos
  const [permissionsModalState, setPermissionsModalState] = useState<{
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

  const handleViewPermissions = (role: Role) => {
    setPermissionsModalState({
      isOpen: true,
      role
    });
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

  const closePermissionsModal = () => {
    setPermissionsModalState({ isOpen: false, role: null });
  };

  const handleCreateRole = () => {
    window.location.href = '/roles/crear';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
      >
        <RolesTable
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          onCreate={handleCreateRole}
          onViewPermissions={handleViewPermissions}
        />
      </ScreenContainer>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={cancelDeleteRole}
        onConfirm={confirmDeleteRole}
        title="Confirmar Eliminación"
        itemName={deleteModalState.role?.name}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />

      {/* Modal de permisos del rol */}
      {permissionsModalState.role && (
        <PermissionsModal
          isOpen={permissionsModalState.isOpen}
          onClose={closePermissionsModal}
          roleName={permissionsModalState.role.name}
          roleDescription={permissionsModalState.role.description}
          permissions={permissionsModalState.role.permissions || []}
        />
      )}
    </div>
  );
};

export default RolesRepository;