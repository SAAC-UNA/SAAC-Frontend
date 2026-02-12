/**
 * ExtensionRequestDetailsModal - Modal para mostrar detalles de una solicitud de ampliación
 * HU-016
 */

import React from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { Button } from '@/Components/Ui/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';

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

  const getEstadoBadge = (estado: ExtensionRequestStatus) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      aprobada: 'bg-green-100 text-green-800 border-green-300',
      rechazada: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[estado]}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de la Solicitud #${solicitud.solicitud_ampliacion_id}`}
      size="lg"
      footerButtons={
        <Button variant="secondary" standardWidth={true}onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Estado */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Estado:</p>
          {getEstadoBadge(solicitud.estado)}
        </div>

        {/* Motivo */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Motivo:</p>
          <p className="text-sm text-gray-900 bg-gray-50 rounded-corner p-3 border border-gray-200">
            {solicitud.motivo}
          </p>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-corner p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <SystemIcons.interface.calendar size="sm" className="text-gray-600" />
              <p className="text-sm font-medium text-gray-700">Fecha de solicitud</p>
            </div>
            <p className="text-base font-semibold text-gray-900">
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
              <p className="text-sm font-medium text-azul-una">Fecha sugerida</p>
            </div>
            <p className="text-base font-semibold text-azul-una">
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
              <p className="text-sm font-medium text-blue-900">Fecha límite actual</p>
            </div>
            <p className="text-sm text-blue-700">
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
              <p className={`text-base font-semibold ${
                solicitud.estado === 'aprobada' ? 'text-green-900' : 'text-red-900'
              }`}>
                {solicitud.estado === 'aprobada' ? 'Solicitud Aprobada' : 'Solicitud Rechazada'}
              </p>
            </div>
            
            {solicitud.justificacion && (
              <div className="mb-3">
                <p className={`text-xs font-medium mb-1 ${
                  solicitud.estado === 'aprobada' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Justificación:
                </p>
                <p className={`text-sm ${
                  solicitud.estado === 'aprobada' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {solicitud.justificacion}
                </p>
              </div>
            )}
            
            {solicitud.fecha_resolucion && (
              <div className={`text-xs flex items-center gap-2 pt-2 border-t ${
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
    </Modal>
  );
};
