/**
 * EvidenceFilesModal - Modal para mostrar archivos asociados a una evidencia.
 * HU023 - Gestión de Informes Finales
 */

import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface EvidenceFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencia: Evidencia | null;
}

export const EvidenceFilesModal: React.FC<EvidenceFilesModalProps> = ({
  isOpen,
  onClose,
  evidencia,
}) => {
  if (!evidencia) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archivos de la evidencia"
      size="md"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
            {evidencia.nomenclatura}
          </span>
          <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>—</span>
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {evidencia.descripcion}
          </span>
        </div>

        <div className="py-6 flex flex-col items-center gap-2">
          <SystemIcons.modal.document className={cn(ICON_SIZES.lg, 'text-gris-light')} />
          <p className={cn(TYPOGRAPHY.modal.body, 'font-medium text-negro-una')}>
            No hay archivos asociados
          </p>
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            Esta evidencia aún no tiene archivos adjuntos.
          </p>
        </div>
      </div>
    </Modal>
  );
};
