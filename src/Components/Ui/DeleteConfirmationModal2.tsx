/**
 * DeleteConfirmationModal - Modal de confirmación para operaciones de eliminación
 * 
 * Ahora usa UniversalModal como base para consistencia visual y menos duplicación de código
 */

import React from 'react';
import { UniversalModal } from './UniversalModal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
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
  variant = 'danger'
}) => {
  const defaultMessage = itemName 
    ? `¿Está seguro de que desea eliminar "${itemName}"?`
    : '¿Está seguro de que desea eliminar este elemento?';

  const finalMessage = message || defaultMessage;

  // Mensaje adicional solo para danger
  const additionalMessage = variant === 'danger' ? (
    <p className="text-xs text-rojo-una mt-2">
      Esta acción no se puede deshacer.
    </p>
  ) : null;

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant={variant}
      title={title}
      message={finalMessage}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmLoading={isLoading}
      showCancel={true}
      showConfirm={true}
    >
      {additionalMessage}
    </UniversalModal>
  );
};