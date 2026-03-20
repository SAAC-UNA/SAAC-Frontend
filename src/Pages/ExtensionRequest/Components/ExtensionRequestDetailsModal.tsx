/**
 * ExtensionRequestDetailsModal - Modal para mostrar detalles de una solicitud de ampliación
 * HU-016
 */

import React from 'react';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { ExtensionRequest } from '@/Types/ExtensionRequestTypes';
import { TYPOGRAPHY } from '@/constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { ExtensionRequestStatusBadge } from './ExtensionRequestStatusBadge';

interface ExtensionRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud: ExtensionRequest | null;
}

export const ExtensionRequestDetailsModal: React.FC<ExtensionRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  solicitud
}) => {
  if (!solicitud) return null;

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de la Solicitud #${solicitud.solicitud_ampliacion_id}`}
      size="lg"
      variant="info"
      heroIcon={<SystemIcons.interface.clock className={`${ICON_SIZES.md} text-blanco-una`} />}
    >
      <div className="space-y-6">
        {/* Estado */}
        <div>
          <p className={` ${TYPOGRAPHY.modal.body} text-negro-una-2 mb-2`}>Estado:</p>
          <ExtensionRequestStatusBadge estado={solicitud.estado} />
        </div>

        {/* Motivo */}
        <div>
          <p className={` ${TYPOGRAPHY.modal.body} text-negro-una-2 mb-2`}>Motivo:</p>
          <p className={` ${TYPOGRAPHY.modal.body} text-gray-900 bg-gray-50 rounded-corner p-3 border border-gray-200 break-words whitespace-pre-wrap`}>
            {solicitud.motivo}
          </p>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-corner p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <SystemIcons.interface.calendar size="sm" className="text-gray-600" />
              <p className={` ${TYPOGRAPHY.modal.body} text-negro-una-2`}>Fecha de solicitud</p>
            </div>
            <p className={`${TYPOGRAPHY.modal.body} font-semibold text-gray-900`}>
              {new Date(solicitud.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="bg-azul-una/5 rounded-corner p-4 border border-azul-una/20">
            <div className="flex items-center gap-2 mb-2">
              <SystemIcons.interface.clock size="sm" className="text-azul-una" />
              <p className={` ${TYPOGRAPHY.modal.body} text-azul-una`}>Fecha sugerida</p>
            </div>
            <p className={`${TYPOGRAPHY.modal.body} font-semibold text-azul-una`}>
              {new Date(solicitud.fecha_sugerida).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Información de asignación */}
        {solicitud.evidencia_asignacion && (
          <div className="bg-blue-50 border border-blue-200 rounded-corner p-4">
            <div className="flex items-center gap-2 mb-2">
              <SystemIcons.interface.informationCircle size="sm" className="text-blue-700" />
              <p className={` ${TYPOGRAPHY.modal.body} text-blue-900`}>Fecha límite actual</p>
            </div>
            <p className={`${TYPOGRAPHY.modal.body} text-blue-700`}>
              {new Date(solicitud.evidencia_asignacion.fecha_limite).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Resolución */}
        {solicitud.estado !== 'pendiente' && (
          <div className={`border rounded-corner p-4 ${
            solicitud.estado === 'aprobada' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {solicitud.estado === 'aprobada' ? (
                <SystemIcons.interface.checkCircle size="md" className="text-green-600" />
              ) : (
                <SystemIcons.interface.xCircle size="md" className="text-red-600" />
              )}
              <p className={`${TYPOGRAPHY.modal.body} font-semibold ${
                solicitud.estado === 'aprobada' ? 'text-green-900' : 'text-red-900'
              }`}>
                {solicitud.estado === 'aprobada' ? 'Solicitud Aprobada' : 'Solicitud Rechazada'}
              </p>
            </div>
            
            {solicitud.justificacion && (
              <div className="mb-3">
                <p className={`${TYPOGRAPHY.badge} font-medium mb-1 ${
                  solicitud.estado === 'aprobada' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Justificación:
                </p>
                <p className={`${TYPOGRAPHY.modal.body} ${
                  solicitud.estado === 'aprobada' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {solicitud.justificacion}
                </p>
              </div>
            )}
            
            {solicitud.fecha_resolucion && (
              <div className={`${TYPOGRAPHY.badge} flex items-center gap-2 pt-2 border-t ${
                solicitud.estado === 'aprobada' ? 'border-green-200' : 'border-red-200'
              }`}>
                <SystemIcons.interface.calendar size="xs" className={
                  solicitud.estado === 'aprobada' ? 'text-green-600' : 'text-red-600'
                } />
                <span className={
                  solicitud.estado === 'aprobada' ? 'text-green-600' : 'text-red-600'
                }>
                  Resuelta el {new Date(solicitud.fecha_resolucion).toLocaleDateString('es-ES')}
                  {solicitud.resolutor?.nombre && ` por ${solicitud.resolutor.nombre}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DetailsModal>
  );
};
