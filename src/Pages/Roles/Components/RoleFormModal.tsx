/**
 * RoleFormModal - Modal unificado para crear y editar roles
 * HU-Roles
 *
 * Modos:
 * - Creación: isEditing=false, no se pasa initialData
 * - Edición: isEditing=true, se pasa initialData con datos del rol
 *
 * Flujo interno:
 * 1. El formulario detecta cambios y llama onHasChangesChange
 * 2. Al confirmar se abre modal de confirmación (crear/editar)
 * 3. Al confirmar la operación se llama onSuccess y se cierra
 */

import React, { useRef, useState } from "react";
import { EntityFormModal } from "@/Components/Ui/Modals/EntityFormModal";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { RoleForm } from "./RoleForm";
import { useRoles } from "@/Hooks/UseRoles";
import { useToast } from "@/Context/ToastContext";
import type { CreateRoleData, Role } from "@/Services/RoleService";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa, entra en modo edición */
  initialData?: Role;
  /** Callback al completar la operación exitosamente */
  onSuccess?: () => void;
}

const truncate = (text: string, max = 30) =>
  text.length > max ? text.slice(0, max).trim() + "…" : text;

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const isEditing = !!initialData;
  const { createRole, editRole } = useRoles();
  const { showToast } = useToast();

  const [hasChanges, setHasChanges] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para modal de confirmación
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    roleData: CreateRoleData | null;
  }>({ isOpen: false, roleData: null });

  // Estado para modal de éxito
  const [successState, setSuccessState] = useState<{
    isOpen: boolean;
    roleName: string;
  }>({ isOpen: false, roleName: "" });

  // Ref al form para dispararle submit
  const formRef = useRef<HTMLFormElement>(null);

  const handleMainConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = (roleData: CreateRoleData) => {
    setConfirmState({ isOpen: true, roleData });
  };

  const handleConfirmOperation = async () => {
    if (!confirmState.roleData) return;
    setIsSubmitting(true);
    try {
      let result;
      if (isEditing && initialData) {
        result = await editRole(initialData.id, confirmState.roleData);
      } else {
        result = await createRole(confirmState.roleData);
      }
      if (result) {
        const createdRoleName = confirmState.roleData.name;
        setConfirmState({ isOpen: false, roleData: null });
        // Esperar al siguiente ciclo para evitar superposicion con otros modales.
        setTimeout(() => {
          setSuccessState({ isOpen: true, roleName: createdRoleName });
        }, 0);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: isEditing ? "Error al editar rol" : "Error al crear rol",
        message:
          error instanceof Error ? error.message : "No se pudo guardar el rol",
      });
      setConfirmState({ isOpen: false, roleData: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessState({ isOpen: false, roleName: "" });
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setHasChanges(!isEditing);
    setConfirmState({ isOpen: false, roleData: null });
    setSuccessState({ isOpen: false, roleName: "" });
    onClose();
  };

  const showFormModal = isOpen && !confirmState.isOpen && !successState.isOpen;
  const showConfirmation = confirmState.isOpen && !successState.isOpen;

  return (
    <>
      <EntityFormModal
        isOpen={showFormModal}
        onClose={handleClose}
        onConfirm={handleMainConfirm}
        title={isEditing ? "Editar Rol" : "Crear Rol"}
        subtitle={isEditing ? initialData?.name : undefined}
        isEditing={isEditing}
        confirmDisabled={!hasChanges}
        size="lg"
        maxHeight="lg"
      >
        <RoleForm
          formRef={formRef}
          initialData={initialData}
          onSubmit={handleFormSubmit}
          hideButtons={true}
          onHasChangesChange={setHasChanges}
        />
      </EntityFormModal>

      {/* Confirmación según modo */}
      {!isEditing ? (
        <CreateConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setConfirmState({ isOpen: false, roleData: null })}
          onConfirm={handleConfirmOperation}
          title="Confirmar creación de rol"
          itemName={confirmState.roleData?.name}
          itemType="rol"
          confirmLabel="Crear"
          isLoading={isSubmitting}
          variant="success"
        />
      ) : (
        <EditConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setConfirmState({ isOpen: false, roleData: null })}
          onConfirm={handleConfirmOperation}
          title="Confirmar edición de rol"
          itemName={confirmState.roleData?.name}
          itemType="rol"
          confirmLabel="Guardar"
          isLoading={isSubmitting}
          variant="warning"
        />
      )}

      {/* Éxito */}
      <SuccessModal
        isOpen={successState.isOpen}
        title={
          isEditing ? "¡Rol editado exitosamente!" : "¡Rol creado exitosamente!"
        }
        message={
          isEditing
            ? `El rol "${truncate(successState.roleName)}" ha sido modificado correctamente.`
            : `El rol "${truncate(successState.roleName)}" ha sido creado correctamente.`
        }
        onClose={handleSuccessClose}
        autoClose={true}
      />
    </>
  );
};
