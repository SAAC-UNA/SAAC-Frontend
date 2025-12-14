/**
 * ReviewExtensionRequestModal - Modal para aprobar/rechazar solicitud de ampliación
 * HU-016 - Gestión de solicitudes de ampliación
 */

import React, { useState } from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { Button } from '@/Components/Ui/Button';
import { Textarea } from '@/Components/Ui/Textarea';
import type { ReviewFormData, ExtensionRequest } from '@/Types/ExtensionRequestTypes';

interface ReviewExtensionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: ReviewFormData) => Promise<void>;
  onReject: (data: ReviewFormData) => Promise<void>;
  solicitud: ExtensionRequest;
}

export const ReviewExtensionRequestModal: React.FC<ReviewExtensionRequestModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  solicitud
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (!isSubmitting) {
      setAction(null);
      setJustificacion('');
      setError('');
      onClose();
    }
  };

  const validateJustificacion = (): boolean => {
    if (action === 'reject' && !justificacion.trim()) {
      setError('La justificación es obligatoria al rechazar');
      return false;
    }

    if (justificacion.trim() && justificacion.length < 10) {
      setError('La justificación debe tener al menos 10 caracteres');
      return false;
    }

    if (justificacion.length > 500) {
      setError('La justificación no puede exceder los 500 caracteres');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateJustificacion()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data: ReviewFormData = {
        justificacion: justificacion.trim() || ''
      };

      if (action === 'approve') {
        await onApprove(data);
      } else if (action === 'reject') {
        await onReject(data);
      }

      handleClose();
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vista inicial: Seleccionar acción
  if (!action) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Revisar Solicitud de Ampliación"
        size="lg"
      >
        <div className="space-y-4">
          {/* Información del solicitante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Información del Solicitante</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nombre:</strong> {solicitud.usuario?.nombre}</p>
              <p><strong>Email:</strong> {solicitud.usuario?.email}</p>
              <p>
                <strong>Fecha de solicitud:</strong>{' '}
                {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Detalles de la solicitud */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Detalles de la Solicitud</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Motivo:</p>
                <p className="text-gray-600 mt-1">{solicitud.motivo}</p>
              </div>
              
              {solicitud.evidencia_asignacion && (
                <div>
                  <p className="font-medium text-gray-700">Fecha límite actual:</p>
                  <p className="text-gray-600">
                    {new Date(solicitud.evidencia_asignacion.fecha_limite).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div>
                <p className="font-medium text-gray-700">Fecha límite solicitada:</p>
                <p className="text-gray-600">
                  {new Date(solicitud.fecha_sugerida).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Importante:</strong> Una vez aprobada o rechazada, la decisión no podrá revertirse.
              {solicitud.evidencia_asignacion && ' Si aprueba, la fecha límite de la asignación se actualizará automáticamente.'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={() => setAction('reject')}
            >
              Rechazar
            </Button>
            <Button
              variant="primary"
              onClick={() => setAction('approve')}
            >
              Aprobar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Vista de confirmación: Aprobar o Rechazar con justificación
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={action === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
      size="md"
    >
      <div className="space-y-4">
        {/* Mensaje de confirmación */}
        <div className={`border rounded-lg p-4 ${
          action === 'approve' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            action === 'approve' ? 'text-green-900' : 'text-red-900'
          }`}>
            {action === 'approve' 
              ? '¿Está seguro que desea aprobar esta solicitud?' 
              : '¿Está seguro que desea rechazar esta solicitud?'}
          </p>
          {action === 'approve' && solicitud.evidencia_asignacion && (
            <p className="text-xs text-green-700 mt-2">
              La fecha límite se actualizará al{' '}
              {new Date(solicitud.fecha_sugerida).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Campo de justificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Justificación {action === 'reject' && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            value={justificacion}
            onChange={(e) => {
              setJustificacion(e.target.value);
              if (error) setError('');
            }}
            placeholder={
              action === 'approve'
                ? 'Opcionalmente, agregue una justificación para la aprobación'
                : 'Explique las razones del rechazo (obligatorio, mín. 10 caracteres)'
            }
            rows={4}
            disabled={isSubmitting}
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {justificacion.length}/500 caracteres
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => {
              setAction(null);
              setJustificacion('');
              setError('');
            }}
            disabled={isSubmitting}
          >
            Volver
          </Button>
          <Button
            variant={action === 'approve' ? 'primary' : 'error'}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Procesando...' 
              : action === 'approve' 
                ? 'Confirmar Aprobación' 
                : 'Confirmar Rechazo'
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
};
