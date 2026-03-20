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

interface ReviewExtensionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: ExtensionRequest;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-2.5 block', TYPOGRAPHY.table.header)}>
    {label}
  </span>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

const formatDate = (dateStr: string, includeTime = false) =>
  new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

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
      cancelLabel="Cerrar"
      size="md"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="flex flex-col gap-5">

        {/* Solicitante */}
        <div>
          <SectionLabel label="Información del Solicitante" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Nombre">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-semibold')}>
                {solicitud.usuario?.nombre ?? '—'}
              </span>
            </InfoCell>
            <InfoCell label="Email">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                {solicitud.usuario?.email ?? '—'}
              </span>
            </InfoCell>
            <InfoCell label="Fecha de solicitud" className="col-span-2">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                {formatDate(solicitud.created_at, true)}
              </span>
            </InfoCell>
          </div>
        </div>

        {/* Detalles */}
        <div>
          <SectionLabel label="Detalles de la Solicitud" />
          <div className="border border-gray-200 rounded-corner p-4 flex flex-col gap-4">
            <InfoCell label="Motivo">
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap break-all')}>
                {solicitud.motivo}
              </p>
            </InfoCell>
            <div className="grid grid-cols-2 gap-x-6">
              {solicitud.evidencia_asignacion && (
                <InfoCell label="Fecha límite actual">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                    {formatDate(solicitud.evidencia_asignacion.fecha_limite)}
                  </span>
                </InfoCell>
              )}
              <InfoCell label="Fecha nueva solicitada">
                <span className={cn(TYPOGRAPHY.table.cell, 'text-info font-semibold')}>
                  {formatDate(solicitud.fecha_sugerida)}
                </span>
              </InfoCell>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-corner border bg-info/10 border-info/30">
          <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'flex-shrink-0 text-info mt-0.5')} />
          <p className={cn(TYPOGRAPHY.form.helper, 'text-info font-medium')}>
            <strong>Importante:</strong> Una vez aprobada o rechazada, la decisión no podrá revertirse.
            {solicitud.evidencia_asignacion && ' Si se aprueba, la fecha límite de la asignación se actualizará automáticamente.'}
          </p>
        </div>

      </div>
    </DetailsModal>
  );
};
