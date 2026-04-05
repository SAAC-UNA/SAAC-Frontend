/**
 * ReviewExtensionRequestModal - Modal de detalles de solicitud de ampliación (solo lectura)
 * HU-016 - Gestión de solicitudes de ampliación
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { ExtensionRequest } from '@/Types/ExtensionRequestTypes';
import { formatDateShort } from '@/Utils/DateUtils';

interface ReviewExtensionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: ExtensionRequest;
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
    <hr className="border-gray-200" />
  </div>
);

export const ReviewExtensionRequestModal: React.FC<ReviewExtensionRequestModalProps> = ({
  isOpen,
  onClose,
  solicitud,
}) => {
  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitud de Ampliación"
      subtitle={solicitud.usuario?.nombre}
      size="lg"
      maxHeight="lg"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div1 — Nombre */}
        <InfoCell label="Nombre" className="col-start-1 col-end-3">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-semibold')}>
            {solicitud.usuario?.nombre ?? '—'}
          </span>
        </InfoCell>

        {/* div2 — Email */}
        <InfoCell label="Email" className="col-start-3 col-end-5">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {solicitud.usuario?.email ?? '—'}
          </span>
        </InfoCell>

        {/* div3 — Fecha de solicitud */}
        <InfoCell label="Fecha de solicitud" className="col-start-5 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(solicitud.created_at, true)}
          </span>
        </InfoCell>

        <Separator />

        {/* div4 — Evidencia (nomenclatura + descripción en una línea) */}
        {solicitud.evidencia_asignacion?.evidencia && (
          <div className="col-span-6 flex flex-col gap-0.5">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-negro-una-2 font-semibold')}>
              {solicitud.evidencia_asignacion.evidencia.nomenclatura}
            </span>
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {solicitud.evidencia_asignacion.evidencia.descripcion}
            </span>
          </div>
        )}

        {/* Modelo flexible: mostrar info del elemento asignado */}
        {!solicitud.evidencia_asignacion?.evidencia && solicitud.elemento_asignacion && (
          <div className="col-span-6 flex flex-col gap-0.5">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-negro-una-2 font-semibold')}>
              {(solicitud.elemento_asignacion as any).element?.nombre ?? `Elemento ${solicitud.elemento_asignacion.elemento_id}`}
            </span>
            {(solicitud.elemento_asignacion as any).element?.tipo && (
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {(solicitud.elemento_asignacion as any).element.tipo}
              </span>
            )}
          </div>
        )}

        {(solicitud.evidencia_asignacion?.evidencia || solicitud.elemento_asignacion) && <Separator />}

        {/* div5 — Fecha límite actual */}
        {(solicitud.evidencia_asignacion || solicitud.elemento_asignacion) && (
          <InfoCell label="Fecha límite actual" className="col-start-1 col-end-4">
            <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
              {formatDateShort(
                solicitud.evidencia_asignacion?.fecha_limite
                ?? solicitud.elemento_asignacion?.fecha_limite
                ?? ''
              )}
            </span>
          </InfoCell>
        )}

        {/* div6 — Fecha nueva solicitada */}
        <InfoCell label="Fecha nueva solicitada" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-info font-semibold')}>
            {formatDateShort(solicitud.fecha_sugerida)}
          </span>
        </InfoCell>

        <Separator />

        {/* div7 — Motivo */}
        <InfoCell label="Motivo" className="col-span-6">
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap break-all')}>
            {solicitud.motivo}
          </p>
        </InfoCell>

        <Separator />

        {/* div8 — Aviso */}
        <div className="col-span-6 flex items-start gap-2.5 px-4 py-3 rounded-corner border bg-info/10 border-info/30">
          <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'shrink-0 text-info mt-0.5')} />
          <p className={cn(TYPOGRAPHY.form.helper, 'text-info font-medium')}>
            <strong>Importante:</strong> Una vez aprobada o rechazada, la decisión no podrá revertirse.
            {solicitud.evidencia_asignacion && ' Si se aprueba, la fecha límite de la asignación se actualizará automáticamente.'}
          </p>
        </div>

      </div>
    </DetailsModal>
  );
};
