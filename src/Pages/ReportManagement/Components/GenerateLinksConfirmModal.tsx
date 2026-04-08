/**
 * GenerateLinksConfirmModal - Confirmación para generar enlaces públicos masivos.
 * HU023 - Gestión de Informes Finales
 */

import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

interface GenerateLinksConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isFlexible?: boolean;
}

export const GenerateLinksConfirmModal: React.FC<GenerateLinksConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  isFlexible = false,
}) => {
  const scopeText = isFlexible
    ? 'todas las fuentes de las pautas aprobadas'
    : 'todas las evidencias de los criterios aprobados';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar enlaces públicos"
      size="md"
      variant="warning"
      showConfirm
      confirmLabel="Sí, generar"
      onConfirm={onConfirm}
      confirmLoading={isLoading}
      showCancel
      cancelLabel="Cancelar"
    >
      <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
        ¿Está seguro que desea generar enlaces públicos para{' '}
        <strong className="text-negro-una">{scopeText}</strong>?
        Esta acción puede tardar un momento.
      </p>
    </Modal>
  );
};
