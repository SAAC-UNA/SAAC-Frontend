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
import { SuccessModal } from '@/Components/Ui/SuccessModal';
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

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    userName: string;
    action: 'activate' | 'deactivate';
  }>({
    isOpen: false,
    userName: '',
    action: 'activate'
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
    const isActivating = user.status === 'inactive';
    
    try {
      if (user.status === 'active') {
        await desactivarUsuario(user.id);
      } else {
        await activarUsuario(user.id);
      }
      
      // Cerrar modal de confirmación
      setStateChangeModalState({ isOpen: false, user: null });
      
      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        userName: user.name,
        action: isActivating ? 'activate' : 'deactivate'
      });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      // En caso de error, solo cerrar el modal de confirmación
      setStateChangeModalState({ isOpen: false, user: null });
    }
  };

  const closeStateChangeModal = () => {
    setStateChangeModalState({ isOpen: false, user: null });
  };

  const closeSuccessModal = () => {
    setSuccessModalState({ isOpen: false, userName: '', action: 'activate' });
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
            message={
              <>
                ¿Está seguro de que desea activar al usuario <strong>"{stateChangeModalState.user?.name}"</strong>?
              </>
            }
            confirmLabel="Activar"
            cancelLabel="Cancelar"
            variant="warning"
            isLoading={isLoading}
            description="Al activar este usuario, podrá acceder al sistema con sus credenciales."
          />
        )}

        {/* Modal de confirmación para inactivación */}
        {stateChangeModalState.user?.status === 'active' && (
          <DeleteConfirmationModal
            isOpen={stateChangeModalState.isOpen}
            onClose={closeStateChangeModal}
            onConfirm={confirmStateChange}
            title="Confirmar inactivación de usuario"
            message={
              <>
                ¿Está seguro de que desea inactivar al usuario <strong>"{stateChangeModalState.user?.name}"</strong>?
              </>
            }
            confirmLabel="Inactivar"
            cancelLabel="Cancelar"
            variant="danger"
            hideDefaultDangerMessage={true}
            isLoading={isLoading}
            description="Al inactivar este usuario, se revocará su acceso al sistema. Esta acción puede ser revertida en el futuro."
          />
        )}

        {/* Modal de éxito */}
        <SuccessModal
          isOpen={successModalState.isOpen}
          onClose={closeSuccessModal}
          title={successModalState.action === 'activate' ? 'Usuario activado' : 'Usuario inactivado'}
          message={
            successModalState.action === 'activate'
              ? `El usuario "${successModalState.userName}" ha sido activado correctamente.`
              : `El usuario "${successModalState.userName}" ha sido inactivado correctamente.`
          }
        />
        </ScreenContainer>
  );
};

export default UsersRepository;
