/**
 * UsersRepository - Página principal de listado de usuarios
 *
 * Esta página coordina el componente UsersTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { UsersTable } from './Components/UsersTable';
import { UserDetailsModal } from './Components/UserDetailsModal';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import { useUsers } from '@/Hooks/UseUsers';
import type { User } from '@/Services/UserService';

const UsersRepository: React.FC = () => {
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.users;

  // Usar el hook de usuarios
  const { activarUsuario, desactivarUsuario } = useUsers();

  // Estado para el modal de detalles del usuario
  const [userDetailsModalState, setUserDetailsModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  const handleEditUser = (user: User) => {
    // TODO: Navegar a página de edición de permisos
    window.location.href = `/usuarios/editar/${user.id}`;
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

  const handleChangeState = async (user: User) => {
    try {
      if (user.status === 'active') {
        await desactivarUsuario(user.id);
      } else {
        await activarUsuario(user.id);
      }
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
};

export default UsersRepository;