/**
 * CreateExtensionRequestModal - Modal para crear una solicitud de ampliación
 * HU-016 - Gestión de solicitudes de ampliación
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modal';
import { Button } from '@/Components/Ui/Button';
import { Textarea } from '@/Components/Ui/Textarea';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import type { ExtensionRequestFormData } from '@/Types/ExtensionRequestTypes';

interface CreateExtensionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ExtensionRequestFormData) => Promise<void>;
  evidenciaAsignacionId: number;
  fechaLimiteActual?: string;
  nombreEvidencia?: string;
}

export const CreateExtensionRequestModal: React.FC<CreateExtensionRequestModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  evidenciaAsignacionId,
  fechaLimiteActual,
  nombreEvidencia
}) => {
  const [formData, setFormData] = useState<ExtensionRequestFormData>({
    evidencia_asignacion_id: evidenciaAsignacionId,
    motivo: '',
    fecha_sugerida: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formData cuando cambia evidenciaAsignacionId
  useEffect(() => {
    if (isOpen) {
      setFormData({
        evidencia_asignacion_id: evidenciaAsignacionId,
        motivo: '',
        fecha_sugerida: ''
      });
      setErrors({});
    }
  }, [isOpen, evidenciaAsignacionId]);

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        evidencia_asignacion_id: evidenciaAsignacionId,
        motivo: '',
        fecha_sugerida: ''
      });
      setErrors({});
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es obligatorio';
    } else if (formData.motivo.length < 10) {
      newErrors.motivo = 'El motivo debe tener al menos 10 caracteres';
    } else if (formData.motivo.length > 300) {
      newErrors.motivo = 'El motivo no puede exceder los 300 caracteres';
    }

    if (!formData.fecha_sugerida) {
      newErrors.fecha_sugerida = 'La fecha sugerida es obligatoria';
    } else {
      const fechaSugerida = new Date(formData.fecha_sugerida);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSugerida <= hoy) {
        newErrors.fecha_sugerida = 'La fecha debe ser posterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(formData);
      handleClose();
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Solicitar Ampliación de Plazo"
      size="md"
      footerButtons={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            standardWidth={true}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            standardWidth={true}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Información de la evidencia */}
        {nombreEvidencia && (
          <div className="bg-blue-50 border border-blue-200 rounded-corner p-3">
            <p className="text-sm font-medium text-blue-900">Evidencia:</p>
            <p className="text-sm text-blue-700">{nombreEvidencia}</p>
          </div>
        )}

        {/* Fecha límite actual */}
        {fechaLimiteActual && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-corner p-3">
            <p className="text-sm font-medium text-yellow-900">Fecha límite actual:</p>
            <p className="text-sm text-yellow-700">
              {new Date(fechaLimiteActual).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Motivo */}
        <div>
          <Textarea
            label="Motivo de la solicitud"
            value={formData.motivo}
            onChange={(e) => {
              setFormData({ ...formData, motivo: e.target.value });
              if (errors.motivo) {
                setErrors({ ...errors, motivo: '' });
              }
            }}
            placeholder="Explique detalladamente las razones por las que necesita más tiempo"
            rows={4}
            disabled={isSubmitting}
            error={errors.motivo}
            required={true}
            characterCount={true}
            maxLength={300}
            helperText="Mínimo 10 caracteres"
            size="sm"
            variant="floating"
          />
        </div>

        {/* Fecha sugerida */}
        <div>
          <DatePicker
            label="Nueva fecha límite solicitada"
            value={formData.fecha_sugerida}
            onChange={(date) => {
              setFormData({ ...formData, fecha_sugerida: date });
              if (errors.fecha_sugerida) {
                setErrors({ ...errors, fecha_sugerida: '' });
              }
            }}
            minDate={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Mañana
            disabled={isSubmitting}
            error={errors.fecha_sugerida}
            required={true}
            placement="top"
          />
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-corner p-3">
          <p className="text-xs text-gray-600">
            <strong>Nota:</strong> La solicitud será revisada por el encargado de acreditación,
            quien decidirá si aprobar o rechazar la ampliación del plazo.
          </p>
        </div>
      </div>
    </Modal>
  );
};
