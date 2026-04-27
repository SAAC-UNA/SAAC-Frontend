import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { cn } from '@/Utils/ClassNames';
import { ELEMENT_TYPE_LABELS } from '@/Constants/StructureConstants';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { BADGE_COLORS, getBadgeColorForString } from '@/Constants/StatusBadges';
import type { StructureElement } from '@/Types/StructureTypes';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
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
  mode?: 'traditional' | 'flexible';
  element: StructureElement | FlexibleElement | null;
  parentName?: string;
  allElements?: FlexibleElement[];
}

export const StructureElementDetail: React.FC<StructureElementDetailProps> = ({
  isOpen,
  onClose,
  mode = 'traditional',
  element,
  parentName,
  allElements,
}) => {
  if (mode === 'flexible') {
    const flexibleElement = element as FlexibleElement | null;
    if (!flexibleElement) return null;

    const title = flexibleElement.nomenclatura || flexibleElement.nombre || flexibleElement.tipo;
    const availableElements = allElements ?? [];

    const getParentLabel = (): string => {
      if (!flexibleElement.padre_id) return 'Sin padre';
      const parent = availableElements.find(
        (el) => el.elemento_id === flexibleElement.padre_id,
      );
      if (!parent) return 'Sin padre';
      return parent.nomenclatura
        ? `${parent.nomenclatura} - ${parent.tipo}`
        : parent.tipo;
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={flexibleElement.tipo}
        heroIcon={
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 text-white font-bold text-base select-none">
            {flexibleElement.tipo.slice(0, 2).toUpperCase()}
          </div>
        }
        variant="info"
        size="lg"
        maxHeight="lg"
        showCancel={false}
        showConfirm={false}
      >
        <div className="grid grid-cols-6 gap-x-4 gap-y-3">
          <InfoCell label="Tipo de elemento" className="col-start-1 col-end-4">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
              {flexibleElement.tipo}
            </span>
          </InfoCell>

          <InfoCell label="Estado" className="col-start-4 col-end-7 items-start">
            <StatusBadge
              label={flexibleElement.activo ? 'Activo' : 'Inactivo'}
              colorClasses={
                flexibleElement.activo
                  ? BADGE_COLORS.verde.colorClasses
                  : BADGE_COLORS.error.colorClasses
              }
            />
          </InfoCell>

          <Separator />

          <InfoCell label="Nomenclatura" className="col-start-1 col-end-4">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {flexibleElement.nomenclatura || 'â€”'}
            </span>
          </InfoCell>

          <InfoCell label="CategorÃ­a" className="col-start-4 col-end-7 items-start">
            {flexibleElement.categoria ? (
              <StatusBadge
                label={flexibleElement.categoria}
                colorClasses={getBadgeColorForString(flexibleElement.categoria)}
              />
            ) : (
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>â€”</span>
            )}
          </InfoCell>

          <Separator />

          <InfoCell label="Identificador" className="col-span-6">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {flexibleElement.nombre || flexibleElement.descripcion || 'â€”'}
            </span>
          </InfoCell>

          <Separator />

          <InfoCell label="Elemento padre" className="col-span-6">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {getParentLabel()}
            </span>
          </InfoCell>
        </div>
      </Modal>
    );
  }

  const traditionalElement = element as StructureElement | null;
  if (!traditionalElement) return null;

  const resolvedParentName = parentName ?? 'Sin elemento padre';

  const typeLabel = ELEMENT_TYPE_LABELS[traditionalElement.type];
  const title = traditionalElement.name || traditionalElement.nomenclature || typeLabel;

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
        {traditionalElement.description && (
          <>
            <InfoCell label="Descripción" className="col-span-6">
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
                {traditionalElement.description}
              </p>
            </InfoCell>
            <Separator />
          </>
        )}

        <InfoCell label="Tipo de elemento" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>{typeLabel}</span>
        </InfoCell>

        {/* div2 - Nombre */}
        <InfoCell label="Nombre" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {traditionalElement.name || traditionalElement.nomenclature || 'â€”'}
          </span>
        </InfoCell>

        <Separator />

        {/* div3 - Estado */}
        <InfoCell label="Estado" className="col-start-1 col-end-4 items-start">
          <StatusBadge
            label={traditionalElement.active ? 'Activo' : 'Inactivo'}
            colorClasses={traditionalElement.active ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
          />
        </InfoCell>

        {/* div4 — Fecha de creación */}
        <InfoCell label="Fecha de creación" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(traditionalElement.createdAt, true)}
          </span>
        </InfoCell>

        <Separator />

        {/* div5 — Elemento padre */}
        <InfoCell label="Elemento padre" className="col-span-6">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {resolvedParentName}
          </span>
        </InfoCell>
      </div>
    </Modal>
  );
};
