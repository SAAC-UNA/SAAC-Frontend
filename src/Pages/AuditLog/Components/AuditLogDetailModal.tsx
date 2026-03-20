/**
 * AuditLogDetailModal - Modal para ver el detalle completo de un registro de bitácora
 * 
 * Muestra:
 * - Información del usuario (nombre, email, ID)
 * - Tipo de acción ejecutada
 * - Módulo del sistema
 * - Detalle completo de la acción
 * - Fecha y hora exacta
 * - Fecha de creación del registro
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { AuditLog } from '@/Types/AuditLogTypes';
import { TYPOGRAPHY } from '@/constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!log) return null;

  /**
   * Formatea una fecha ISO a formato completo legible
   */
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

  /**
   * Obtiene el icono y color según el tipo de acción
   */
  const getActionIcon = (actionType: string): { icon: React.ReactNode; color: string } => {
    const actionMap: Record<string, { icon: React.ReactNode; color: string }> = {
      crear: { icon: <SystemIcons.structure.create className="w-5 h-5" />, color: 'text-green-600' },
      editar: { icon: <SystemIcons.actions.edit className="w-5 h-5" />, color: 'text-blue-600' },
      eliminar: { icon: <SystemIcons.actions.delete className="w-5 h-5" />, color: 'text-red-600' },
      consultar: { icon: <SystemIcons.actions.view className="w-5 h-5" />, color: 'text-gray-600' },
      login: { icon: <SystemIcons.users.user className="w-5 h-5" />, color: 'text-green-600' },
      logout: { icon: <SystemIcons.actions.logout className="w-5 h-5" />, color: 'text-orange-600' },
      login_fallido: { icon: <SystemIcons.interface.alert className="w-5 h-5" />, color: 'text-red-600' },
      activar: { icon: <SystemIcons.interface.checkCircle className="w-5 h-5" />, color: 'text-green-600' },
      desactivar: { icon: <SystemIcons.actions.cancel className="w-5 h-5" />, color: 'text-gray-600' },
      asignar_rol: { icon: <SystemIcons.users.roles className="w-5 h-5" />, color: 'text-purple-600' },
      asignar_permisos: { icon: <SystemIcons.modal.key className="w-5 h-5" />, color: 'text-indigo-600' },
      exportar: { icon: <SystemIcons.repository.boxArchive className="w-5 h-5" />, color: 'text-teal-600' },
      asignar: { icon: <SystemIcons.actions.save className="w-5 h-5" />, color: 'text-blue-600' },
    };

    return actionMap[actionType.toLowerCase()] || { 
      icon: <SystemIcons.interface.informationCircle className="w-5 h-5" />, 
      color: 'text-gray-600' 
    };
  };

  const { icon, color } = getActionIcon(log.tipo_accion.descripcion);

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Registro de Bitácora"
      size="lg"
      variant="neutral"
      heroIcon={<SystemIcons.navigation.auditLog className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="space-y-6">
        {/* ID del Registro */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SystemIcons.interface.informationCircle className={`${ICON_SIZES.sm} text-gray-400`} />
            <span className={` ${TYPOGRAPHY.body} text-gray-600`}>ID del Registro:</span>
            <span className={` ${TYPOGRAPHY.body} font-semibold text-gray-900`}>#{log.bitacora_id}</span>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="bg-gray-50 rounded-corner p-4">
          <div className="flex items-center gap-2 mb-3">
            <SystemIcons.users.user className={` ${ICON_SIZES.sm} text-primary-600`} />
            <h4 className={` ${TYPOGRAPHY.body} font-semibold text-gray-900`}>Usuario</h4>
          </div>
          <div className="space-y-2 ml-7">
            {log.usuario ? (
              <>
                <div className="flex items-start gap-2">
                  <span className={` ${TYPOGRAPHY.body} text-gray-600 w-20`}>Nombre:</span>
                  <span className={` ${TYPOGRAPHY.body} font-medium text-gray-900`}>{log.usuario.nombre}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={` ${TYPOGRAPHY.body} text-gray-600 w-20`}>Email:</span>
                  <span className={` ${TYPOGRAPHY.body} text-gray-700`}>{log.usuario.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={` ${TYPOGRAPHY.body} text-gray-600 w-20`}>ID:</span>
                  <span className={` ${TYPOGRAPHY.body} text-gray-700`}>#{log.usuario.usuario_id}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SystemIcons.auth.AlertCircle className={`${ICON_SIZES.sm} text-orange-500`} />
                <span className={` ${TYPOGRAPHY.body} text-gray-600 italic`}>
                  Usuario desconocido
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Información de la Acción */}
        <div className="bg-blue-50 rounded-corner p-4">
          <div className="flex items-center gap-2 mb-3">
            {icon}
            <h4 className={` ${TYPOGRAPHY.body} font-semibold text-gray-900`}>Acción Ejecutada</h4>
          </div>
          <div className="space-y-2 ml-7">
            <div className="flex items-start gap-2">
              <span className={` ${TYPOGRAPHY.body} text-gray-600 w-24`}>Tipo:</span>
              <span className={` ${TYPOGRAPHY.body} font-semibold ${color} uppercase`}>
                {log.tipo_accion.descripcion}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className={` ${TYPOGRAPHY.body} text-gray-600 w-24`}>Módulo:</span>
              <span className={` ${TYPOGRAPHY.body} text-gray-900`}>
                {log.modulo || <span className={` ${TYPOGRAPHY.body} text-gray-400 italic`}>Sin módulo especificado</span>}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className={` ${TYPOGRAPHY.body} text-gray-600 w-24`}>ID Acción:</span>
              <span className={` ${TYPOGRAPHY.body} text-gray-700`}>#{log.tipo_accion.tipo_accion_id}</span>
            </div>
          </div>
        </div>

        {/* Detalle de la Acción */}
        <div className="bg-gray-50 rounded-corner p-4">
          <div className="flex items-center gap-2 mb-3">
            <SystemIcons.modal.document className={` ${ICON_SIZES.sm} text-gray-600`} />
            <h4 className={` ${TYPOGRAPHY.body} font-semibold text-gray-900`}>Detalle</h4>
          </div>
          <div className="ml-7">
            {log.detalle ? (
              <p className={` ${TYPOGRAPHY.body} text-gray-700 leading-relaxed whitespace-pre-wrap`}>
                {log.detalle}
              </p>
            ) : (
              <p className={` ${TYPOGRAPHY.body} text-gray-400 italic`}>Sin detalle adicional</p>
            )}
          </div>
        </div>

        {/* Información de Tiempo */}
        <div className="bg-green-50 rounded-corner p-4">
          <div className="flex items-center gap-2 mb-3">
            <SystemIcons.interface.calendar className={` ${ICON_SIZES.sm} text-green-600`} />
            <h4 className={` ${TYPOGRAPHY.body}font-semibold text-gray-900`}>Información de Tiempo</h4>
          </div>
          <div className="space-y-2 ml-7">
            <div className="flex items-start gap-2">
              <span className={` ${TYPOGRAPHY.body} text-gray-600 w-40`}>Fecha y Hora:</span>
              <span className={` ${TYPOGRAPHY.body} font-medium text-gray-900 capitalize`}>
                {formatDateFull(log.fecha_hora)}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className={` ${TYPOGRAPHY.body} text-gray-600 w-40`}>Registrado el:</span>
              <span className={` ${TYPOGRAPHY.body} text-gray-700 capitalize`}>
                {formatDateFull(log.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Nota de Inmutabilidad */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-corner p-3">
          <div className="flex items-start gap-2">
            <SystemIcons.modal.key className={` ${ICON_SIZES.sm} text-yellow-600 flex-shrink-0 mt-0.5`} />
            <div>
              <p className={` ${TYPOGRAPHY.body} font-medium text-yellow-800`}>Registro Inmutable</p>
              <p className={` ${TYPOGRAPHY.body} text-yellow-700 mt-1`}>
                Este registro no puede ser modificado ni eliminado para garantizar la trazabilidad
                y seguridad del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DetailsModal>
  );
};
