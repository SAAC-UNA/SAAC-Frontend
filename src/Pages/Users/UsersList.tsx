/**
 * UsersRepository - Página principal de listado de usuarios
 *
 * Esta página coordina el componente UsersTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from './Components/UsersTable';
import { UserDetailsModal } from './Components/UserDetailsModal';
import { EditConfirmationModal } from '@/Components/Ui/EditConfirmationModal';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import { useUsers } from '@/Hooks/UseUsers';
import type { User } from '@/Services/UserService';

const UsersRepository: React.FC = () => {
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.users;
  const navigate = useNavigate();

  // Usar el hook de usuarios
  const { activarUsuario, desactivarUsuario, isLoading } = useUsers();

  // Estado para el modal de detalles del usuario
  const [userDetailsModalState, setUserDetailsModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  // Estado para el modal de confirmación de cambio de estado
  const [stateChangeModalState, setStateChangeModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  const handleEditUser = (user: User) => {
    navigate(`/usuarios/editar/${user.id}`);
  };

  const handleViewUser = (user: User) => {
    setUserDetailsModalState({
      isOpen: true,
      user
    });
  };

  const closeUserDetailsModal = () => {
    setUserDetailsModalState({ isOpen: false, user: null });
  };

  const handleChangeState = (user: User) => {
    setStateChangeModalState({
      isOpen: true,
      user
    });
  };

  const confirmStateChange = async () => {
    if (!stateChangeModalState.user) return;

    try {
      const user = stateChangeModalState.user;
      if (user.status === 'active') {
        await desactivarUsuario(user.id);
      } else {
        await activarUsuario(user.id);
      }
      
      // Cerrar el modal después de completar la acción
      setStateChangeModalState({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      // No cerrar el modal en caso de error para que el usuario pueda reintentar
    }
  };

  const closeStateChangeModal = () => {
    setStateChangeModalState({ isOpen: false, user: null });
  };

  return (
    <>
      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
      >
          <UsersTable
            onViewUser={handleViewUser}
            onEdit={handleEditUser}
            onState={handleChangeState}
          />
        </ScreenContainer>

        {/* Modal de detalles del usuario */}
        <UserDetailsModal
          isOpen={userDetailsModalState.isOpen}
          onClose={closeUserDetailsModal}
          user={userDetailsModalState.user}
        />

        {/* Modal de confirmación para activación */}
        {stateChangeModalState.user?.status === 'inactive' && (
          <EditConfirmationModal
            isOpen={stateChangeModalState.isOpen}
            onClose={closeStateChangeModal}
            onConfirm={confirmStateChange}
            title="Confirmar activación de usuario"
            message={`¿Está seguro de que desea activar al usuario "${stateChangeModalState.user?.name}"?`}
            confirmLabel="Activar"
            cancelLabel="Cancelar"
            variant="info"
            isLoading={isLoading}
            description="Al activar este usuario, podrá acceder al sistema con sus credenciales."
          />
        )}

        {/* Modal de confirmación para desactivación */}
        {stateChangeModalState.user?.status === 'active' && (
          <DeleteConfirmationModal
            isOpen={stateChangeModalState.isOpen}
            onClose={closeStateChangeModal}
            onConfirm={confirmStateChange}
            title="Confirmar desactivación de usuario"
            message={`¿Está seguro de que desea desactivar al usuario "${stateChangeModalState.user?.name}"?`}
            confirmLabel="Desactivar"
            cancelLabel="Cancelar"
            variant="danger"
            hideDefaultDangerMessage={true}
            isLoading={isLoading}
            description="Al desactivar este usuario, se revocará su acceso al sistema. Esta acción puede ser revertida en el futuro."
          />
        )}
    </>
  );
};

export default UsersRepository;
