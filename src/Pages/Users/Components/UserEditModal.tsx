/**
 * UserEditModal - Modal unificado para editar el rol de un usuario
 *
 * Flujo interno:
 * 1. Muestra EditUserForm con hideButtons (botones manejados por el modal)
 * 2. Al confirmar → abre EditConfirmationModal
 * 3. Al confirmar la operación → llama onSuccess y muestra SuccessModal
 */

import React, { useRef, useState } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { EditUserForm } from './EditUserForm';
import { userService } from '@/Services/UserService';
import type { User } from '@/Services/UserService';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const truncate = (text: string, max = 35) =>
  text.length > max ? text.slice(0, max).trim() + '…' : text;

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    userData: { userId: number; roleName: string; userName: string } | null;
  }>({ isOpen: false, userData: null });

  const [successState, setSuccessState] = useState<{
    isOpen: boolean;
    userName: string;
  }>({ isOpen: false, userName: '' });

  // Ref para disparar el submit del formulario desde el botón del modal
  const submitRef = useRef<(() => void) | null>(null);

  const handleMainConfirm = () => {
    submitRef.current?.();
  };

  const handleFormSubmit = (userData: { userId: number; roleName: string; userName: string }) => {
    setConfirmState({ isOpen: true, userData });
  };

  const handleConfirmUpdate = async () => {
    if (!confirmState.userData) return;
    setIsSubmitting(true);
    try {
      const { userId, roleName, userName } = confirmState.userData;
      await userService.assignUserRole(userId, roleName);
      setConfirmState({ isOpen: false, userData: null });
      setSuccessState({ isOpen: true, userName });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setConfirmState({ isOpen: false, userData: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessState({ isOpen: false, userName: '' });
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setHasChanges(false);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      <EntityFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleMainConfirm}
        title="Editar Usuario"
        subtitle={user.name}
        isEditing={true}
        confirmDisabled={!hasChanges}
        confirmLoading={isSubmitting}
        size="lg"
      >
        <EditUserForm
          user={user}
          onSubmit={handleFormSubmit}
          submitRef={submitRef}
          hideButtons={true}
          onHasChangesChange={setHasChanges}
        />
      </EntityFormModal>

      <EditConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, userData: null })}
        onConfirm={handleConfirmUpdate}
        title="Confirmar edición de usuario"
        itemName={confirmState.userData?.userName ? truncate(confirmState.userData.userName) : ''}
        itemType="usuario"
        confirmLabel="Guardar"
        isLoading={isSubmitting}
        variant="warning"
      />

      <SuccessModal
        isOpen={successState.isOpen}
        title="¡Usuario actualizado exitosamente!"
        message={`El rol del usuario "${truncate(successState.userName)}" ha sido actualizado correctamente.`}
        onClose={handleSuccessClose}
        autoClose={true}
      />
    </>
  );
};
