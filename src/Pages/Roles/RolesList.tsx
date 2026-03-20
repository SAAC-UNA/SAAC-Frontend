/**
 * RolesRepository - Página principal de listado de roles
 * 
 * Esta página coordina el componente RolesTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { RolesTable } from './Components/RolesTable';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { Button } from '@/Components/Ui/Buttons/Button';
import { RoleFormModal } from './Components/RoleFormModal';
import { useRoles } from '@/Hooks/UseRoles';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import type { Role } from '@/Services/RoleService';

// Lazy load de modales
const DeleteConfirmationModal = lazy(() => import('@/Components/Ui/Modals/DeleteConfirmationModal').then(m => ({ default: m.DeleteConfirmationModal })));
const PermissionsModal = lazy(() => import('@/Pages/Roles/Components/PermissionsRoleModal').then(m => ({ default: m.PermissionsModal })));
const SuccessModal = lazy(() => import('@/Components/Ui/Modals/SuccessModal').then(m => ({ default: m.SuccessModal })));

const RolesRepository: React.FC = () => {
  const { deleteRole, roles, loadRoles, isLoading, error } = useRoles();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('roles', 'list');
  
  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para el modal de creación/edición de rol
  const [roleFormModalState, setRoleFormModalState] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({ isOpen: false, role: null });
  
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

  // Estado para el modal de éxito (eliminación)
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    roleName: string;
  }>({
    isOpen: false,
    roleName: ''
  });

  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, roleName: '' });
  };

  const handleEditRole = (role: Role) => {
    setRoleFormModalState({ isOpen: true, role });
  };

  const handleCreateRole = () => {
    setRoleFormModalState({ isOpen: true, role: null });
  };

  const handleRoleFormSuccess = () => {
    loadRoles();
    setRoleFormModalState({ isOpen: false, role: null });
  };

  const handleViewPermissions = (role: Role) => {
    setPermissionsModalState({ isOpen: true, role });
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModalState({ isOpen: true, role });
  };

  const confirmDeleteRole = async () => {
    if (deleteModalState.role) {
      try {
        const result = await deleteRole(deleteModalState.role.id);
        if (result) {
          const roleName = deleteModalState.role.name;
          setDeleteModalState({ isOpen: false, role: null });
          setSuccessModalState({ isOpen: true, roleName });
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

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return (
    <>
      <ScreenContainer>
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          headerExtra={
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
              <SearchInput
                placeholder="Buscar roles..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <Button
                onClick={handleCreateRole}
                variant="secondary"
                className="gap-2"
              >
                Crear
              </Button>
            </div>
          }
        >
        </PageHeader>

          <RolesTable
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onViewPermissions={handleViewPermissions}
            roles={roles}
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
          />
        </ScreenContainer>

        {/* Modal de confirmación de eliminación */}
        <Suspense fallback={null}>
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
        </Suspense>

        {/* Modal de permisos del rol */}
        {permissionsModalState.role && (
          <Suspense fallback={null}>
            <PermissionsModal
              isOpen={permissionsModalState.isOpen}
              onClose={closePermissionsModal}
              roleName={permissionsModalState.role?.name || ''}
              roleDescription={permissionsModalState.role?.description || ''}
              permissions={permissionsModalState.role?.permissions || []}
            />
          </Suspense>
        )}
        {/* Modal de éxito (eliminación) */}
        <Suspense fallback={null}>
          <SuccessModal
            isOpen={successModalState.isOpen}
            title="¡Rol eliminado exitosamente!"
            message={`El rol "${successModalState.roleName}" ha sido eliminado correctamente`}
            onClose={handleSuccessModalClose}
            autoClose={true}
          />
        </Suspense>

        {/* Modal de creación / edición de rol */}
        <RoleFormModal
          isOpen={roleFormModalState.isOpen}
          onClose={() => setRoleFormModalState({ isOpen: false, role: null })}
          initialData={roleFormModalState.role ?? undefined}
          onSuccess={handleRoleFormSuccess}
        />
    </>
  );
};

export default RolesRepository;