import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { ExtensionRequest } from '@/Types/ExtensionRequestTypes';
import { formatDateShort } from '@/Utils/DateUtils';

interface ExtensionRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: ExtensionRequest | null;
}

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string; labelClassName?: string }> = ({
  label, children, className, labelClassName,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle, labelClassName)}>
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
      size="lg"
      maxHeight="lg"
      variant="info"
      heroIcon={<SystemIcons.modal.document className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div1 — Fecha de solicitud */}
        <InfoCell label="Fecha de solicitud" className="col-start-1 col-end-3">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {formatDateShort(solicitud.created_at, true)}
          </span>
        </InfoCell>

        {/* div2 — Fecha límite actual */}
        <InfoCell label="Fecha límite actual" className="col-start-3 col-end-5">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {solicitud.evidencia_asignacion
              ? formatDateShort(solicitud.evidencia_asignacion.fecha_limite)
              : solicitud.elemento_asignacion?.fecha_limite
                ? formatDateShort(solicitud.elemento_asignacion.fecha_limite)
                : '—'}
          </span>
        </InfoCell>

        {/* div3 — Fecha nueva solicitada (destacada) */}
        <InfoCell
          label="Fecha nueva solicitada"
          className="col-start-5 col-end-7"
          labelClassName="text-info"
        >
          <span className={cn(TYPOGRAPHY.modal.body, 'text-info font-semibold')}>
            {formatDateShort(solicitud.fecha_sugerida)}
          </span>
        </InfoCell>

        <Separator />

        {/* div4 — Motivo */}
        <InfoCell label="Motivo" className="col-span-6">
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 whitespace-pre-wrap break-all')}>
            {solicitud.motivo}
          </p>
        </InfoCell>

        <Separator />

        {/* div5 — Resolución o Aviso */}
        {isResolved ? (
          <div className={cn(
            'col-span-6 flex flex-col gap-3 px-4 py-3 rounded-corner border',
            isApproved ? 'border-info-ring bg-info-light' : 'border-error-ring bg-error-light',
          )}>
            <div className="flex items-center gap-2">
              {isApproved
                ? <SystemIcons.interface.checkCircle className={cn(ICON_SIZES.sm, 'text-info shrink-0')} />
                : <SystemIcons.interface.xCircle className={cn(ICON_SIZES.sm, 'text-error shrink-0')} />
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
                  Resuelta el {formatDateShort(solicitud.fecha_resolucion)}
                  {solicitud.resolutor?.nombre && <> por <strong>{solicitud.resolutor.nombre}</strong></>}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-6 flex items-start gap-2.5 px-4 py-3 rounded-corner border bg-info/10 border-info/30">
            <SystemIcons.interface.informationCircle className={cn(ICON_SIZES.sm, 'shrink-0 text-info mt-0.5')} />
            <p className={cn(TYPOGRAPHY.form.helper, 'text-info font-medium')}>
              Su solicitud está siendo revisada. Recibirá una notificación cuando sea resuelta.
            </p>
          </div>
        )}

      </div>
    </DetailsModal>
  );
};


