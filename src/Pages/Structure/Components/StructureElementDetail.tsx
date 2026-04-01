import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { cn } from '@/Utils/ClassNames';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { StructureElement } from '@/Types/StructureTypes';
import { formatDateShort } from '@/Utils/DateUtils';

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
  </div>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
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
  const heroInitials = typeLabel.slice(0, 2).toUpperCase();
  const title = element.name || element.nomenclature || typeLabel;
  const isActive = element.active;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={typeLabel}
      heroIcon={
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 text-white font-bold text-base select-none">
          {heroInitials}
        </div>
      }
      variant="info"
      size="lg"
      maxHeight="lg"
      showCancel={false}
      showConfirm={false}
    >
      <div className="flex flex-col gap-5">

        {/* IDENTIFICACIÓN */}
        <div>
          <SectionLabel label="Identificación" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Tipo de elemento">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-medium')}>{typeLabel}</span>
            </InfoCell>
            <InfoCell label="Estado">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold',
                TYPOGRAPHY.badge,
                isActive
                  ? 'bg-verde-light text-verde-dark border border-verde-ring'
                  : 'bg-error-light text-error-dark border border-error-ring',
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isActive ? 'bg-verde' : 'bg-error')} />
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </InfoCell>
            {element.nomenclature && (
              <InfoCell label="Nomenclatura">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{element.nomenclature}</span>
              </InfoCell>
            )}
            {element.name && (
              <InfoCell label="Nombre">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{element.name}</span>
              </InfoCell>
            )}
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        {element.description && (
          <div>
            <SectionLabel label="Descripción" />
            <div className="border border-gray-200 rounded-corner p-4">
              <p className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 leading-relaxed')}>{element.description}</p>
            </div>
          </div>
        )}

        {/* JERARQUÍA + REGISTRO */}
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <SectionLabel label="Jerarquía" />
            <div className="border border-gray-200 rounded-corner p-4 h-[calc(100%-2rem)]">
              <InfoCell label="Elemento padre">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-azul-una flex-shrink-0" />
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{parentName}</span>
                </div>
              </InfoCell>
            </div>
          </div>
          <div>
            <SectionLabel label="Registro" />
            <div className="border border-gray-200 rounded-corner p-4 h-[calc(100%-2rem)]">
              <InfoCell label="Fecha de creación">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{formatDateShort(element.createdAt, true)}</span>
              </InfoCell>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
