/**
 * UsersRepository - Página principal de listado de usuarios
 *
 * Esta página coordina el componente UsersTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from './Components/UsersTable';
import { UserDetailsModal } from './Components/UserDetailsModal';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import { useUsers } from '@/Hooks/UseUsers';
import type { User } from '@/Services/UserService';

const UsersRepository: React.FC = () => {
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('users', 'list');
  const navigate = useNavigate();

  // Usar el hook de usuarios
  const { activarUsuario, desactivarUsuario, isLoading, users, loadUsers, error } = useUsers();

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

    const user = stateChangeModalState.user;
    
    try {
      if (user.status === 'active') {
        await desactivarUsuario(user.id);
      } else {
        await activarUsuario(user.id);
      }
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
    } finally {
      // Siempre cerrar el modal, sin importar si hubo error o no
      setStateChangeModalState({ isOpen: false, user: null });
    }
  };

  const closeStateChangeModal = () => {
    setStateChangeModalState({ isOpen: false, user: null });
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (

      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
        variant="full-width"
      >
          <UsersTable
            onViewUser={handleViewUser}
            onEdit={handleEditUser}
            onState={handleChangeState}
            users={users}
            isLoading={isLoading}
            error={error}
          />


        {/* Modal de detalles del usuario */}
        <UserDetailsModal
          isOpen={userDetailsModalState.isOpen}
          onClose={closeUserDetailsModal}
          user={userDetailsModalState.user}
        />

        {/* Modal de confirmación para activación */}
        {stateChangeModalState.user?.status === 'inactive' && (
          <DeleteConfirmationModal
            isOpen={stateChangeModalState.isOpen}
            onClose={closeStateChangeModal}
            onConfirm={confirmStateChange}
            title="Confirmar activación de usuario"
            message={`¿Está seguro de que desea activar al usuario "${stateChangeModalState.user?.name}"?`}
            confirmLabel="Activar"
            cancelLabel="Cancelar"
            variant="warning"
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
        </ScreenContainer>
  );
};

export default UsersRepository;
