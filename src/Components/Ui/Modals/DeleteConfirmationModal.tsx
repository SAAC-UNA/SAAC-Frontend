import React from 'react';
import { Modal } from './Modal';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

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
  footerMeta?: string;
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
  footerMeta = 'Esta acción no se puede deshacer',
}) => {
  const defaultMessage = itemName
    ? (
        <>
          ¿Está seguro de que desea eliminar "<span className="font-bold">{itemName}</span>"?
        </>
      )
    : '¿Está seguro de que desea eliminar este elemento?';

  const finalMessage = message ?? defaultMessage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant={variant}
      title={title}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmLoading={isLoading}
      showCancel
      showConfirm
      footerMeta={footerMeta}
    >
      <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>{finalMessage}</p>
      {description && (
        <div className="mt-3 p-3 bg-[var(--color-error-light)] border border-[var(--color-error-ring)] rounded-corner">
          <p className={cn(TYPOGRAPHY.modal.body, 'text-error-dark')}>{description}</p>
        </div>
      )}
    </Modal>
  );
};