/**
 * EditUserPage - Página para editar roles y permisos de usuarios
 * 
 * Funcionalidades:
 * - Detección automática del usuario por URL
 * - Carga automática de datos del usuario
 * - Interfaz similar a la edición de roles
 * - Manejo de estados de carga y errores
 * - Redirección después de operaciones exitosas
 * 
 * Rutas compatibles:
 * - /usuarios/editar/:id -> Editar usuario
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditUserForm } from './Components/EditUserForm';
import { LoadingSpinner, BackendErrorAlert, ScreenContainer } from '@/components/Ui/Index';
import { EditConfirmationModal } from '@/Components/Ui/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { userService } from '@/Services/UserService';
import type { User } from '@/Services/UserService';
import { getModuleInfoWithDynamicTitle } from '@/Constants/ModuleInfo';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados para el usuario
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Estado para el modal de confirmación
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    userData: { userId: number; roleName: string; userName: string } | null;
  }>({
    isOpen: false,
    userData: null
  });

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    userName: string;
  }>({
    isOpen: false,
    userName: ''
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (id) {
      loadUserData(parseInt(id));
    } else {
      setLoadError('ID de usuario no válido');
      setIsLoadingUser(false);
    }
  }, [id]);

  /**
   * Cargar los datos del usuario
   */
  const loadUserData = async (userId: number) => {
    setIsLoadingUser(true);
    setLoadError(null);

    try {
      // Aquí necesitaríamos un método getUserById en el UserService
      // Por ahora usaremos listUsers y filtraremos
      const users = await userService.listUsers();
      const userData = users.find(u => u.id === userId);
      
      if (userData) {
        // Transformar de BackendUser a User si es necesario
        const transformedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          status: userData.status,
          role: userData.roles[0]?.name,
          directPermissions: userData.direct_permissions?.map(p => p.name) || [],
          allPermissions: userData.all_permissions || [],
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at)
        };
        
        setUser(transformedUser);
      } else {
        setLoadError('Usuario no encontrado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando usuario';
      setLoadError(errorMessage);
    } finally {
      setIsLoadingUser(false);
    }
  };

  /**
   * Manejar el envío del formulario - abrir modal de confirmación
   */
  const handleFormSubmit = (userData: { userId: number; roleName: string; userName: string }) => {
    setConfirmModalState({
      isOpen: true,
      userData
    });
  };

  /**
   * Confirmar la actualización del usuario
   */
  const confirmUpdate = async () => {
    if (confirmModalState.userData) {
      try {
        const { userId, roleName, userName } = confirmModalState.userData;
        await userService.assignUserRole(userId, roleName);
        
        // Cerrar modal de confirmación
        setConfirmModalState({ isOpen: false, userData: null });
        
        // Mostrar modal de éxito
        setSuccessModalState({
          isOpen: true,
          userName
        });
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        // Cerrar modal de confirmación incluso si hay error
        setConfirmModalState({ isOpen: false, userData: null });
      }
    }
  };

  /**
   * Cancelar la confirmación
   */
  const cancelConfirmation = () => {
    setConfirmModalState({ isOpen: false, userData: null });
  };

  /**
   * Cerrar modal de éxito y volver a la lista
   */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, userName: '' });
    navigate('/usuarios/listar');
  };

  /**
   * Volver a la lista de usuarios
   */
  const handleCancel = () => {
    navigate('/usuarios/listar');
  };

  /**
   * Reintentar carga del usuario
   */
  const handleRetry = () => {
    if (id) {
      loadUserData(parseInt(id));
    }
  };

  // Estado de carga
  if (isLoadingUser) {
    return (
      <ScreenContainer showHeader={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // Estado de error
  if (loadError || !user) {
    return (
      <ScreenContainer showHeader={false}>
        <BackendErrorAlert
          error={loadError || 'Usuario no encontrado'}
          onRetry={handleRetry}
        />
      </ScreenContainer>
    );
  }

  // Obtener información del módulo dinámicamente
  const moduleInfo = getModuleInfoWithDynamicTitle('users', 'edit', user.name);

  return (
    <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
        variant="full-width"
      >
        {/* Formulario de edición */}
        <EditUserForm
          user={user}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />

      {/* Modal de confirmación de edición */}
      <EditConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={cancelConfirmation}
        onConfirm={confirmUpdate}
        itemName={confirmModalState.userData?.userName || ''}
        itemType="usuario"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={handleSuccessModalClose}
        title="Usuario Actualizado"
        message={`El usuario "${successModalState.userName}" ha sido actualizado correctamente.`}
      />
    </ScreenContainer>
  );
};

export default EditUserPage;