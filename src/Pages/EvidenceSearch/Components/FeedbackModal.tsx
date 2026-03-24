/**
 * RetroalimentacionModal — HU-013: Retroalimentación de Evidencias
 *
 * Permite al encargado de acreditación (o Administrador / Superusuario)
 * marcar una evidencia como 'Observada' (requiere corrección) o 'Validada'
 * (aprobada formalmente), con un comentario obligatorio.
 *
 * Visible únicamente para roles autorizados:
 *   - Encargado de Acreditación
 *   - Administrador
 *   - Superusuario
 */

import React, { useState, useCallback } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { useToast } from '@/Context/ToastContext';
import {
  feedbackService,
  type FeedbackEstado,
} from '@/Services/FeedbackService';
import type { EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceSearchResult | null;
  /** Callback para actualizar la tabla tras el envío */
  onSuccess?: (evidenciaId: number, nuevoEstado: FeedbackEstado) => void;
}

const ESTADOS_OPCIONES: { value: FeedbackEstado; label: string; description: string }[] = [
  {
    value: 'Observada',
    label: 'Observada',
    description: 'Requiere corrección — el responsable debe subsanar las observaciones.',
  },
  {
    value: 'Validada',
    label: 'Validada',
    description: 'Aprobada formalmente — la evidencia cumple los criterios de evaluación.',
  },
];

const MIN_COMENTARIO = 5;
const MAX_COMENTARIO = 800;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  evidence,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [estado, setEstado] = useState<FeedbackEstado | ''>('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ estado?: string; comentario?: string }>({});

  const resetForm = useCallback(() => {
    setEstado('');
    setComentario('');
    setErrors({});
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!estado) newErrors.estado = 'Seleccione un estado.';
    if (!comentario.trim()) {
      newErrors.comentario = 'El comentario es requerido.';
    } else if (comentario.trim().length < MIN_COMENTARIO) {
      newErrors.comentario = `El comentario debe tener al menos ${MIN_COMENTARIO} caracteres.`;
    } else if (comentario.trim().length > MAX_COMENTARIO) {
      newErrors.comentario = `El comentario no puede superar los ${MAX_COMENTARIO} caracteres.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!evidence || !estado) return;
    if (!validate()) return;

    setLoading(true);
    try {
      await feedbackService.retroalimentar(evidence.evidencia_id, {
        estado: estado as FeedbackEstado,
        comentario: comentario.trim(),
      });

      showToast({
        type: 'success',
        title: 'Retroalimentación enviada',
        message: `La evidencia ${evidence.nomenclatura} fue marcada como "${estado}".`,
      });

      onSuccess?.(evidence.evidencia_id, estado as FeedbackEstado);
      handleClose();
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.estado?.[0] ||
        error.response?.data?.errors?.comentario?.[0];

      if (error.response?.status === 403) {
        showToast({
          type: 'error',
          title: 'Sin autorización',
          message: 'No tiene permisos para retroalimentar evidencias.',
        });
      } else if (error.response?.status === 422 && backendMsg) {
        showToast({ type: 'error', title: 'Validación', message: backendMsg });
      } else {
        showToast({
          type: 'error',
          title: 'Error al enviar',
          message: backendMsg || 'Intente nuevamente.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [evidence, estado, comentario, showToast, onSuccess, handleClose]);

  if (!evidence) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Retroalimentación de Evidencia"
      subtitle={`${evidence.nomenclatura} — ${evidence.criterio_nomenclatura}`}
      variant="warning"
      size="md"
      showConfirm
      confirmLabel="Enviar"
      onConfirm={handleSubmit}
      confirmLoading={loading}
      showCancel
      cancelLabel="Cancelar"
    >
      <div className="flex flex-col gap-5 py-1">

        {/* Selector de estado */}
        <div className="flex flex-col gap-2">
          <label className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.form.label}`}>
            Estado <span className="text-error-dark">*</span>
          </label>
          <div className="flex flex-col gap-3">
            {ESTADOS_OPCIONES.map((opcion) => (
              <label
                key={opcion.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  estado === opcion.value
                    ? 'border-azul-una bg-azul-ring'
                    : 'border-gris-una-3 hover:border-gris-una-2 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="estado_retroalimentacion"
                  value={opcion.value}
                  checked={estado === opcion.value}
                  onChange={() => {
                    setEstado(opcion.value);
                    setErrors(prev => ({ ...prev, estado: undefined }));
                  }}
                  className="mt-0.5 accent-azul-una"
                />
                <div className="flex flex-col">
                  <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.body}`}>
                    {opcion.label}
                  </span>
                  <span className={`text-gris-una-2 ${TYPOGRAPHY.form.helper}`}>
                    {opcion.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.estado && (
            <p className={`text-error-dark ${TYPOGRAPHY.form.helper}`}>{errors.estado}</p>
          )}
        </div>

        {/* Campo de comentario */}
        <Textarea
          label="Comentario"
          required
          value={comentario}
          onChange={(e) => {
            setComentario(e.target.value);
            setErrors(prev => ({ ...prev, comentario: undefined }));
          }}
          rows={5}
          maxLength={MAX_COMENTARIO}
          placeholder="Describa las observaciones o el motivo de la validación (mín. 5 caracteres)..."
          error={errors.comentario}
          characterCount
        />
      </div>
    </Modal>
  );
};
