/**
 * DeleteConfirmationModal - Modal de confirmación para operaciones de eliminación
 * 
 * Utiliza el componente Modal base con variant="danger" o "warning".
 * Los botones tienen ancho fijo de 128px (standardWidth={true}) por estandarización.
 */

import React from 'react';
import { Modal } from './Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | React.ReactNode;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
  description?: string;
  hideDefaultDangerMessage?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar eliminación',
  message,
  itemName,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'danger',
  description,
  hideDefaultDangerMessage = false
}) => {
  const defaultMessage = itemName
    ? (
        <>
          ¿Está seguro de que desea eliminar "<span className="font-bold">{itemName}</span>"?
        </>
      )
    : '¿Está seguro de que desea eliminar este elemento?';

  const finalMessage = message || defaultMessage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant={variant}
      hideDefaultDangerMessage={hideDefaultDangerMessage}
      title={title}
      message={finalMessage}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmLoading={isLoading}
      showCancel={true}
      showConfirm={true}
    >
      {description && (
        <div className="mt-4 p-3 bg-[var(--bg-error)] border border-[var(--border-error)] rounded-lg">
          <p className="text-sm text-[var(--text-error)]">
            {description}
          </p>
        </div>
      )}
    </Modal>
  );
};