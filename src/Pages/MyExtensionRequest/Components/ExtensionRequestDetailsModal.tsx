import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { ExtensionRequest } from '@/Types/ExtensionRequestTypes';

interface ExtensionRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: ExtensionRequest | null;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-2.5 block', TYPOGRAPHY.modal.subtitle)}>
    {label}
  </span>
);

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

const formatDate = (dateStr: string, includeTime = false) =>
  new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

export const ExtensionRequestDetailsModal: React.FC<ExtensionRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  solicitud,
}) => {
  if (!solicitud) return null;

  const isApproved = solicitud.estado === 'aprobada';
  const isRejected = solicitud.estado === 'rechazada';
  const isResolved = isApproved || isRejected;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mi Solicitud de Ampliación"
      subtitle={`#${solicitud.solicitud_ampliacion_id}`}
      size="lg"
      maxHeight="lg"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="flex flex-col gap-5">

        {/* Detalles */}
        <div>
          <SectionLabel label="Detalles de la Solicitud" />
          <div className="border border-gris-light rounded-corner p-4 flex flex-col gap-4">
            <InfoCell label="Motivo">
              <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap break-all')}>
                {solicitud.motivo}
              </p>
            </InfoCell>
            <div className="grid grid-cols-2 gap-x-6">
              <InfoCell label="Fecha de solicitud">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                  {formatDate(solicitud.created_at, true)}
                </span>
              </InfoCell>
              <InfoCell label="Fecha nueva solicitada">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                  {formatDate(solicitud.fecha_sugerida)}
                </span>
              </InfoCell>
            </div>
            {solicitud.evidencia_asignacion && (
              <InfoCell label="Fecha límite actual">
                <span className={cn(TYPOGRAPHY.modal.body, 'text-info font-semibold')}>
                  {formatDate(solicitud.evidencia_asignacion.fecha_limite)}
                </span>
              </InfoCell>
            )}
          </div>
        </div>

        {/* Resolución */}
        {isResolved && (
          <div>
            <SectionLabel label="Resolución" />
            <div className={cn(
              'border rounded-corner p-4 flex flex-col gap-3',
              isApproved ? 'border-info-ring bg-info-light' : 'border-error-ring bg-error-light'
            )}>
              <div className="flex items-center gap-2">
                {isApproved
                  ? <SystemIcons.interface.checkCircle className={cn(ICON_SIZES.sm, 'text-info flex-shrink-0')} />
                  : <SystemIcons.interface.xCircle className={cn(ICON_SIZES.sm, 'text-error flex-shrink-0')} />
                }
                <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold', isApproved ? 'text-info' : 'text-error')}>
                  {isApproved ? 'Solicitud aprobada' : 'Solicitud rechazada'}
                </span>
              </div>

              {solicitud.justificacion && (
                <InfoCell label="Justificación">
                  <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap break-all')}>
                    {solicitud.justificacion}
                  </p>
                </InfoCell>
              )}

              {solicitud.fecha_resolucion && (
                <div className={cn('flex items-center gap-1.5 pt-2 border-t', isApproved ? 'border-info-ring' : 'border-error-ring')}>
                  <span className={cn(TYPOGRAPHY.form.helper, isApproved ? 'text-info' : 'text-error')}>
                    Resuelta el {formatDate(solicitud.fecha_resolucion)}
                    {solicitud.resolutor?.nombre && <> por <strong>{solicitud.resolutor.nombre}</strong></>}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aviso (solo si pendiente) */}
        {!isResolved && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-corner border bg-info/10 border-info/30">
            <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'flex-shrink-0 text-info mt-0.5')} />
            <p className={cn(TYPOGRAPHY.form.helper, 'text-info font-medium')}>
              Su solicitud está siendo revisada. Recibirá una notificación cuando sea resuelta.
            </p>
          </div>
        )}

      </div>
    </DetailsModal>
  );
};


