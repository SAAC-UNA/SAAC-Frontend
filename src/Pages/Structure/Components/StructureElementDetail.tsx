import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import type { StructureElement } from '@/Types/StructureTypes';
import { formatDateShort } from '@/Utils/DateUtils';

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

const Separator: React.FC = () => (
  <div className="col-span-6 py-1">
    <hr className="border-gris-light" />
  </div>
);

interface StructureElementDetailProps {
  isOpen: boolean;
  onClose: () => void;
  element: StructureElement | null;
  parentName: string;
}

export const StructureElementDetail: React.FC<StructureElementDetailProps> = ({
  isOpen,
  onClose,
  element,
  parentName,
}) => {
  if (!element) return null;

  const typeLabel = ELEMENT_TYPE_LABELS[element.type];
  const title = element.name || element.nomenclature || typeLabel;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={typeLabel}
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
      variant="info"
      size="lg"
      maxHeight="lg"
      showCancel={false}
      showConfirm={false}
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div1 — Tipo de elemento */}
        <InfoCell label="Tipo de elemento" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>{typeLabel}</span>
        </InfoCell>

        {/* div2 — Nombre */}
        <InfoCell label="Nombre" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {element.name || element.nomenclature || '—'}
          </span>
        </InfoCell>

        <Separator />

        {/* div3 — Estado */}
        <InfoCell label="Estado" className="col-start-1 col-end-4 items-start">
          <StatusBadge
            label={element.active ? 'Activo' : 'Inactivo'}
            colorClasses={element.active ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
          />
        </InfoCell>

        {/* div4 — Fecha de creación */}
        <InfoCell label="Fecha de creación" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(element.createdAt, true)}
          </span>
        </InfoCell>

        <Separator />

        {/* div5 — Elemento padre */}
        <InfoCell label="Elemento padre" className="col-span-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-azul-una flex-shrink-0" />
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>{parentName}</span>
          </div>
        </InfoCell>

        {/* Descripción (opcional, si existe) */}
        {element.description && (
          <>
            <Separator />
            <InfoCell label="Descripción" className="col-span-6">
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
                {element.description}
              </p>
            </InfoCell>
          </>
        )}

      </div>
    </Modal>
  );
};
