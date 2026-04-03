/**
 * AccreditationCycleDetailModal
 * Muestra el detalle completo de un ciclo de acreditación en un modal.
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import type { AccreditationCycle, AccreditationCycleStatus } from '@/Types/AccreditationCycleTypes';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AccreditationCycleStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  completado: 'Completado',
};

const STATUS_COLOR: Record<AccreditationCycleStatus, string> = {
  activo: 'text-verde-dark bg-verde-ring',
  inactivo: 'text-error-dark bg-error-ring',
  completado: 'text-info-dark bg-info-ring',
};

// ── Helper components ─────────────────────────────────────────────────────────

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

// ── Date helper ───────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateStr));
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AccreditationCycleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: AccreditationCycle | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const AccreditationCycleDetailModal: React.FC<AccreditationCycleDetailModalProps> = ({
  isOpen,
  onClose,
  cycle,
}) => {
  if (!cycle) return null;

  const cs = cycle.carrera_sede;
  const modelo = cycle.modelo_estructura;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={cycle.nombre}
      subtitle="Detalle del ciclo de acreditación"
      size="lg"
      maxHeight="lg"
      variant="info"
      heroIcon={
        <SystemIcons.modal.document
          className={cn(ICON_SIZES.md, 'text-blanco-una')}
        />
      }
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div1 — Nombre */}
        <InfoCell label="Nombre" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {cycle.nombre}
          </span>
        </InfoCell>

        {/* div2 — Estado */}
        <InfoCell label="Estado" className="col-start-4 col-end-7 items-start">
          <StatusBadge
            label={STATUS_LABEL[cycle.estado]}
            colorClasses={STATUS_COLOR[cycle.estado]}
          />
        </InfoCell>

        <Separator />

        {/* div3 — Carrera */}
        <InfoCell label="Carrera" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {cs?.carrera_nombre ?? '—'}
          </span>
        </InfoCell>

        {/* div4 — Sede */}
        <InfoCell label="Sede" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {cs?.sede_nombre ?? '—'}
          </span>
        </InfoCell>

        <Separator />

        {/* div5 — Nombre del modelo */}
        <InfoCell label="Nombre del modelo" className="col-start-1 col-end-3">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {modelo?.nombre ?? '—'}
          </span>
        </InfoCell>

        {/* div6 — Tipo */}
        <InfoCell label="Tipo" className="col-start-3 col-end-5">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {modelo?.tipo ?? '—'}
          </span>
        </InfoCell>

        {/* div7 — Versión */}
        <InfoCell label="Versión" className="col-start-5 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {modelo?.version ?? 'Sin versión'}
          </span>
        </InfoCell>

        <Separator />

        {/* div8 — Creado el */}
        <InfoCell label="Creado el" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDate(cycle.created_at)}
          </span>
        </InfoCell>

        {/* div9 — Última actualización */}
        <InfoCell label="Última actualización" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDate(cycle.updated_at)}
          </span>
        </InfoCell>

      </div>
    </DetailsModal>
  );
};
