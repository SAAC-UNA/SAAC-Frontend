import React from "react";
import { DetailsModal } from "@/Components/Ui/Modals/DetailsModal";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { BADGE_COLORS } from "@/Constants/StatusBadges";
import { cn } from "@/Utils/ClassNames";
import { formatDateShort } from "@/Utils/DateUtils";
import type { AccreditationProcess } from "@/Types/AccreditationProcessTypes";

interface AccreditationProcessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: AccreditationProcess | null;
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

const Separator: React.FC = () => (
  <div className="col-span-6 py-1">
    <hr className="border-gris-light" />
  </div>
);

export const AccreditationProcessDetailsModal: React.FC<
  AccreditationProcessDetailsModalProps
> = ({ isOpen, onClose, process }) => {
  if (!process) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={process.type}
      subtitle="Detalles del proceso de acreditación"
      variant="info"
      size="lg"
      maxHeight="lg"
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div3 — Tipo de proceso */}
        <InfoCell label="Tipo de proceso" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {process.type}
          </span>
        </InfoCell>

        {/* div4 — Ciclo de acreditación */}
        <InfoCell label="Ciclo de acreditación" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {process.accreditationCycleName}
          </span>
        </InfoCell>

        <Separator />

        {/* div5 — Estado */}
        <InfoCell label="Estado" className="col-start-1 col-end-4 items-start">
          <StatusBadge
            label={process.status === 'activo' ? 'Activo' : 'Inactivo'}
            colorClasses={process.status === 'activo' ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
          />
        </InfoCell>

        {/* div6 — Creado */}
        <InfoCell label="Creado" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(process.createdAt)}
          </span>
        </InfoCell>

        <Separator />

        {/* div1 — Carrera */}
        <InfoCell label="Carrera" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {process.careerName || '—'}
          </span>
        </InfoCell>

        {/* div2 — Sede */}
        <InfoCell label="Sede" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {process.campusName || '—'}
          </span>
        </InfoCell>

        <Separator />

        {/* div7 — Fecha de inicio */}
        <InfoCell label="Fecha de inicio" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(process.startDate)}
          </span>
        </InfoCell>

        {/* div8 — Fecha estimada de finalización */}
        <InfoCell label="Fecha estimada de finalización" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(process.estimatedEndDate)}
          </span>
        </InfoCell>

      </div>
    </DetailsModal>
  );
};
