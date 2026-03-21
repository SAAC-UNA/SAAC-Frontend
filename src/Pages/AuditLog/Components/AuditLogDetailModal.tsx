import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { cn } from '@/Utils/ClassNames';
import type { AuditLog } from '@/Types/AuditLogTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

const ACTION_BADGE: Record<string, string> = {
  crear:            'bg-verde-ring text-verde-dark',
  editar:           'bg-warning-ring text-warning-dark',
  eliminar:         'bg-error-ring text-error-dark',
  consultar:        'bg-gris-light text-gris-una',
  login:            'bg-verde-ring text-verde-dark',
  logout:           'bg-error-ring text-error-dark',
  login_fallido:    'bg-error-ring text-error-dark',
  activar:          'bg-verde-ring text-verde-dark',
  desactivar:       'bg-gris-light text-gris-una',
  asignar_rol:      'bg-morado-ring text-morado-dark',
  asignar_permisos: 'bg-indigo-ring text-indigo-dark',
  exportar:         'bg-teal-ring text-teal-dark',
  asignar:          'bg-info-ring text-info-dark',
};

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
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
    {children}
  </div>
);

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!log) return null;

  const formatDateFull = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Bitácora"
      size="lg"
      maxHeight='lg'
      variant="neutral"
      heroIcon={<SystemIcons.navigation.auditLog className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="flex flex-col gap-5">

        {/* Usuario */}
        <div>
          <SectionLabel label="Usuario" />
          <div className="border border-gray-200 rounded-corner p-4">
            {log.usuario ? (
              <div className="grid grid-cols-2 gap-4">
                <InfoCell label="Nombre">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-normal')}>
                    {log.usuario.nombre}
                  </span>
                </InfoCell>
                <InfoCell label="Correo electrónico">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                    {log.usuario.email}
                  </span>
                </InfoCell>
                {log.usuario.roles && log.usuario.roles.length > 0 && (
                  <InfoCell label="Rol" className="col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {log.usuario.roles.map(rol => (
                        <StatusBadge
                          key={rol}
                          label={rol}
                          colorClasses="bg-morado-ring text-morado-dark"
                        />
                      ))}
                    </div>
                  </InfoCell>
                )}
              </div>
            ) : (
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 italic')}>
                Usuario desconocido
              </span>
            )}
          </div>
        </div>

        {/* Acción ejecutada */}
        <div>
          <SectionLabel label="Acción ejecutada" />
          <div className="border border-gray-200 rounded-corner p-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoCell label="Tipo">
                <StatusBadge
                  label={log.tipo_accion.descripcion}
                  colorClasses={ACTION_BADGE[log.tipo_accion.descripcion.toLowerCase()] ?? 'bg-gray-100 text-gray-800'}
                />
              </InfoCell>
              {log.modulo && (
                <InfoCell label="Módulo">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                    {log.modulo}
                  </span>
                </InfoCell>
              )}
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div>
          <SectionLabel label="Detalle" />
          <div className="border border-gray-200 rounded-corner p-4">
            <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 leading-relaxed whitespace-pre-wrap')}>
              {log.detalle || <span className="italic">Sin detalle adicional</span>}
            </span>
          </div>
        </div>

        {/* Fechas */}
        <div>
          <SectionLabel label="Información de tiempo" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-4">
            <InfoCell label="Fecha y hora">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 capitalize')}>
                {formatDateFull(log.fecha_hora)}
              </span>
            </InfoCell>
            <InfoCell label="Registrado el">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 capitalize')}>
                {formatDateFull(log.created_at)}
              </span>
            </InfoCell>
          </div>
        </div>

        {/* Nota de inmutabilidad */}
        <div className="p-4 flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 font-semibold')}>
              Registro inmutable
            </span>
            <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 leading-relaxed')}>
              Este registro no puede ser modificado ni eliminado para garantizar la trazabilidad y seguridad del sistema.
            </span>
          </div>
        </div>

      </div>
    </DetailsModal>
  );
};
