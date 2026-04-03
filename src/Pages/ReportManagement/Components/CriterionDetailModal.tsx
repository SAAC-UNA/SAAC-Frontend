/**
 * CriterionDetailModal - Modal para mostrar el detalle completo de un criterio.
 * HU023 - Gestión de Informes Finales
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface CriterionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterio: Criterio | null;
}

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

export const CriterionDetailModal: React.FC<CriterionDetailModalProps> = ({
  isOpen,
  onClose,
  criterio,
}) => {
  if (!criterio) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={criterio.nomenclatura}
      subtitle="Descripción completa del criterio"
      size="md"
      variant="info"
      heroIcon={
        <SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />
      }
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        <InfoCell label="Criterio" className="col-start-1 col-end-7">
          <div className="flex items-center gap-2">
            <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
              {criterio.nomenclatura}
            </span>
            <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una-2')}>—</span>
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
              {criterio.descripcion}
            </span>
          </div>
        </InfoCell>

      </div>
    </DetailsModal>
  );
};
