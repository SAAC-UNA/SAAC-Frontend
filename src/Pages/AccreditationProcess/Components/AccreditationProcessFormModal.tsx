import React, { useRef, useState } from "react";
import { EntityFormModal } from "@/Components/Ui/Modals/EntityFormModal";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { AccreditationProcessFormContent } from "./AccreditationProcessFormContent";
import type {
  AccreditationCycle,
  AccreditationProcess,
  AccreditationProcessFormData,
} from "@/Types/AccreditationProcessTypes";

interface AccreditationProcessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: AccreditationCycle[];
  initialData?: AccreditationProcess | null;
  onSave: (
    formData: AccreditationProcessFormData,
    processId?: string,
  ) => Promise<AccreditationProcess | null>;
  onSuccess?: () => void;
}

const truncate = (text: string, max = 35) =>
  text.length > max ? text.slice(0, max).trim() + "…" : text;

export const AccreditationProcessFormModal: React.FC<
  AccreditationProcessFormModalProps
> = ({ isOpen, onClose, cycles, initialData, onSave, onSuccess }) => {
  const isEditing = Boolean(initialData);

  const [hasChanges, setHasChanges] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    formData: AccreditationProcessFormData | null;
  }>({ isOpen: false, formData: null });

  const [successState, setSuccessState] = useState<{
    isOpen: boolean;
    processType: string;
  }>({ isOpen: false, processType: "" });

  const formRef = useRef<HTMLFormElement>(null);

  const handleMainConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = (formData: AccreditationProcessFormData) => {
    setError(null);
    setConfirmState({ isOpen: true, formData });
  };

  const handleConfirmOperation = async () => {
    if (!confirmState.formData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSave(confirmState.formData, initialData?.id);
      if (result) {
        setConfirmState({ isOpen: false, formData: null });
        setSuccessState({ isOpen: true, processType: result.type });
      }
    } catch (operationError: unknown) {
      const errorMessage =
        operationError instanceof Error
          ? operationError.message
          : "No se pudo guardar el proceso de acreditación.";

      setError(errorMessage);
      setConfirmState({ isOpen: false, formData: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessState({ isOpen: false, processType: "" });
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setError(null);
    setConfirmState({ isOpen: false, formData: null });
    setHasChanges(!isEditing);
    onClose();
  };

  return (
    <>
      <EntityFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleMainConfirm}
        title={
          isEditing
            ? "Editar Proceso de Acreditación"
            : "Crear Proceso de Acreditación"
        }
        subtitle={isEditing ? initialData?.type : undefined}
        isEditing={isEditing}
        confirmDisabled={!hasChanges}
        confirmLoading={isSubmitting}
        size="lg"
      >
        <AccreditationProcessFormContent
          formRef={formRef}
          cycles={cycles}
          initialData={initialData || undefined}
          onSubmit={handleFormSubmit}
          onHasChangesChange={setHasChanges}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-corner">
            <p className="text-sm text-rojo-una">{error}</p>
          </div>
        )}
      </EntityFormModal>

      {!isEditing ? (
        <CreateConfirmationModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, formData: null })}
          onConfirm={handleConfirmOperation}
          title="Confirmar creación de proceso"
          itemName={confirmState.formData?.type}
          itemType="proceso"
          confirmLabel="Crear"
          isLoading={isSubmitting}
          variant="success"
        />
      ) : (
        <EditConfirmationModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ isOpen: false, formData: null })}
          onConfirm={handleConfirmOperation}
          title="Confirmar edición de proceso"
          itemName={confirmState.formData?.type}
          itemType="proceso"
          confirmLabel="Guardar"
          isLoading={isSubmitting}
          variant="warning"
        />
      )}

      <SuccessModal
        isOpen={successState.isOpen}
        title={
          isEditing
            ? "¡Proceso actualizado exitosamente!"
            : "¡Proceso creado exitosamente!"
        }
        message={
          isEditing
            ? `El proceso "${truncate(successState.processType)}" ha sido actualizado correctamente.`
            : `El proceso "${truncate(successState.processType)}" ha sido creado correctamente.`
        }
        onClose={handleSuccessClose}
        autoClose={true}
      />
    </>
  );
};
