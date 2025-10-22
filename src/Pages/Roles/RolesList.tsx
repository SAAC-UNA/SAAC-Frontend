/**
 * RolesRepository - Página principal de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RolesTable } from './Components/RolesTable';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';
import { PermissionsModal } from '@/Components/Ui/PermissionsRoleModal';
import { useRoles } from '@/Hooks/UseRoles';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import type { Role } from '@/Services/RoleService';
import { SuccessModal } from '@/Components/Ui/SuccessModal';

const RolesRepository: React.FC = () => {
  const { deleteRole, roles, loadRoles, isLoading, error } = useRoles();
  const navigate = useNavigate();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('roles', 'list');
  
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

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    roleName: string;
  }>({
    isOpen: false,
    roleName: ''
  });

  /**
   * Maneja el cierre del modal de éxito y redirecciona
   */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, roleName: '' });
    navigate('/roles/listar');
  };

  const handleEditRole = (role: Role) => {
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
          const roleName = deleteModalState.role.name;
          setDeleteModalState({ isOpen: false, role: null });
          
          // Mostrar modal de éxito
          setSuccessModalState({
            isOpen: true,
            roleName: roleName
          });
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

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return (
    <>
      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
        variant="full-width"
      >
          <RolesTable
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onCreate={handleCreateRole}
            onViewPermissions={handleViewPermissions}
            roles={roles}
            isLoading={isLoading}
            error={error}
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
            roleName={permissionsModalState.role?.name || ''}
            roleDescription={permissionsModalState.role?.description || ''}
            permissions={permissionsModalState.role?.permissions || []}
          />
        )}
        {/* Modal de éxito */}
        <SuccessModal
          isOpen={successModalState.isOpen}
          title="¡Rol eliminado exitosamente!"
          message={`El rol "${successModalState.roleName}" ha sido eliminado correctamente`}
          onClose={handleSuccessModalClose}
          autoClose={true}
        />
    </>
  );
};

export default RolesRepository;