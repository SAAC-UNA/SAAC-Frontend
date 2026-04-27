import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import {
  BADGE_COLORS,
  getFlexibleCategoryBadgeColor,
} from '@/Constants/StatusBadges';
import type { FlexibleElement } from '@/Types/StructureModelTypes';

interface FlexibleElementDetailProps {
  isOpen: boolean;
  onClose: () => void;
  element: FlexibleElement | null;
  elements: FlexibleElement[];
}

const InfoCell: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span
      className={cn(
        'uppercase tracking-wider font-semibold text-gris-una-2',
        TYPOGRAPHY.modal.subtitle,
      )}
    >
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

export const FlexibleElementDetail: React.FC<FlexibleElementDetailProps> = ({
  isOpen,
  onClose,
  element,
  elements,
}) => {
  if (!element) return null;

  const title = element.nomenclatura || element.nombre || element.tipo;

  const getParentLabel = (): string => {
    if (!element.padre_id) return 'Sin padre';
    const parent = elements.find((el) => el.elemento_id === element.padre_id);
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
      subtitle={element.tipo}
      heroIcon={
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 text-white font-bold text-base select-none">
          {element.tipo.slice(0, 2).toUpperCase()}
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
            {element.tipo}
          </span>
        </InfoCell>

        <InfoCell label="Estado" className="col-start-4 col-end-7 items-start">
          <StatusBadge
            label={element.activo ? 'Activo' : 'Inactivo'}
            colorClasses={
              element.activo
                ? BADGE_COLORS.verde.colorClasses
                : BADGE_COLORS.error.colorClasses
            }
          />
        </InfoCell>

        <Separator />

        <InfoCell label="Nomenclatura" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {element.nomenclatura || 'Sin nomenclatura'}
          </span>
        </InfoCell>

        <InfoCell label="Categoria" className="col-start-4 col-end-7 items-start">
          {element.categoria ? (
            <StatusBadge
              label={element.categoria}
              colorClasses={getFlexibleCategoryBadgeColor(element.categoria)}
            />
          ) : (
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>Sin categoria</span>
          )}
        </InfoCell>

        <Separator />

        <InfoCell label="Identificador" className="col-span-6">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {element.nombre || element.descripcion || 'Sin identificador'}
          </span>
        </InfoCell>

        <Separator />

        <InfoCell label="Descripcion" className="col-span-6">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed wrap-break-word')}>
            {element.descripcion || 'Sin descripcion'}
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
};
