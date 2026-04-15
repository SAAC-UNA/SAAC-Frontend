import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { cn } from '@/Utils/ClassNames';
import { AUDIT_ACTION_BADGE, BADGE_COLORS } from '@/Constants/StatusBadges';
import type { AuditLog } from '@/Types/AuditLogTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { formatDateFull } from '@/Utils/DateUtils';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    {children}
  </div>
);

const Separator: React.FC = () => (
  <div className="col-span-6 py-1">
    <hr className="border-gray-200" />
  </div>
);

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!log) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Bitácora"
      size="lg"
      maxHeight='lg'
      variant="info"
      heroIcon={<SystemIcons.navigation.auditLog className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-3">

        {/* div1 — Nombre */}
        <InfoCell label="Nombre" className="col-start-1 col-end-3">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-normal')}>
            {log.usuario?.nombre ?? <span className="italic">Desconocido</span>}
          </span>
        </InfoCell>

        {/* div2 — Correo electrónico */}
        <InfoCell label="Correo electrónico" className="col-start-3 col-end-5">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {log.usuario?.email ?? <span className="italic">—</span>}
          </span>
        </InfoCell>

        {/* div3 — Rol */}
        <InfoCell label="Rol" className="col-start-5 col-end-7 items-start">
          <div className="flex flex-wrap gap-2">
            {log.usuario?.roles && log.usuario.roles.length > 0 ? (
              log.usuario.roles.map(rol => (
                <StatusBadge
                  key={rol}
                  label={rol}
                  colorClasses={BADGE_COLORS.slate.colorClasses}
                />
              ))
            ) : (
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 italic')}>—</span>
            )}
          </div>
        </InfoCell>

        <Separator />

        {/* div4 — Tipo de acción */}
        <InfoCell label="Tipo de acción" className="col-start-1 col-end-4 items-start">
          <StatusBadge
            label={AUDIT_ACTION_BADGE[log.tipo_accion.descripcion.toLowerCase()]?.label ?? log.tipo_accion.descripcion}
            colorClasses={AUDIT_ACTION_BADGE[log.tipo_accion.descripcion.toLowerCase()]?.colorClasses ?? 'bg-slate-light text-slate'}
          />
        </InfoCell>

        {/* div5 — Módulo */}
        <InfoCell label="Módulo" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {log.modulo ?? <span className="italic">—</span>}
          </span>
        </InfoCell>

        <Separator />

        {/* div6 — Detalle */}
        <InfoCell label="Detalle" className="col-span-6">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed whitespace-pre-wrap')}>
            {log.detalle || <span className="italic">Sin detalle adicional</span>}
          </span>
        </InfoCell>

        <Separator />

        {/* div7 — Fecha y hora */}
        <InfoCell label="Fecha y hora" className="col-start-1 col-end-4">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 capitalize')}>
            {formatDateFull(log.fecha_hora)}
          </span>
        </InfoCell>

        {/* div8 — Registrado el */}
        <InfoCell label="Registrado el" className="col-start-4 col-end-7">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 capitalize')}>
            {formatDateFull(log.created_at)}
          </span>
        </InfoCell>

        <Separator />

        {/* div9 — Nota de inmutabilidad */}
        <div className="col-span-6 flex flex-col gap-1">
          <span className={cn(TYPOGRAPHY.form.helper, 'text-info font-semibold')}>
            Registro inmutable
          </span>
          <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 leading-relaxed')}>
            Este registro no puede ser modificado ni eliminado para garantizar la trazabilidad y seguridad del sistema.
          </span>
        </div>

      </div>
    </DetailsModal>
  );
};
