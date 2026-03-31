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

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-2.5 block', TYPOGRAPHY.modal.subtitle)}>
    {label}
  </span>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
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
        <SystemIcons.navigation.auditLog
          className={cn(ICON_SIZES.md, 'text-blanco-una')}
        />
      }
    >
      <div className="flex flex-col gap-5">

        {/* ── Información del ciclo ──────────────────────────────────────── */}
        <div>
          <SectionLabel label="Información del ciclo" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Nombre" className="col-span-2">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
                {cycle.nombre}
              </span>
            </InfoCell>

            <InfoCell label="Estado" className="col-span-2">
              <StatusBadge
                label={STATUS_LABEL[cycle.estado]}
                colorClasses={STATUS_COLOR[cycle.estado]}
                size="sm"
              />
            </InfoCell>
          </div>
        </div>

        {/* ── Carrera y Sede ─────────────────────────────────────────────── */}
        <div>
          <SectionLabel label="Carrera y Sede" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Carrera">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
                {cs?.carrera_nombre ?? '—'}
              </span>
            </InfoCell>

            <InfoCell label="Sede">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
                {cs?.sede_nombre ?? '—'}
              </span>
            </InfoCell>
          </div>
        </div>

        {/* ── Modelo de estructura ───────────────────────────────────────── */}
        <div>
          <SectionLabel label="Modelo de estructura" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Nombre del modelo" className="col-span-2">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>
                {modelo?.nombre ?? '—'}
              </span>
            </InfoCell>

            <InfoCell label="Tipo">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {modelo?.tipo ?? '—'}
              </span>
            </InfoCell>

            <InfoCell label="Versión">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {modelo?.version ?? 'Sin versión'}
              </span>
            </InfoCell>
          </div>
        </div>

        {/* ── Fechas de registro ─────────────────────────────────────────── */}
        <div>
          <SectionLabel label="Registro" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Creado el">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {formatDate(cycle.created_at)}
              </span>
            </InfoCell>

            <InfoCell label="Última actualización">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {formatDate(cycle.updated_at)}
              </span>
            </InfoCell>
          </div>
        </div>

      </div>
    </DetailsModal>
  );
};
