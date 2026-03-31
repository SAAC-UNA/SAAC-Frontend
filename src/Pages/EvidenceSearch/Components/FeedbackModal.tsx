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
import { RadioGroupCards, type RadioCardOption } from '@/Components/Ui/Forms/RadioGroupCards';
import { useToast } from '@/Context/ToastContext';
import {
  feedbackService,
  type FeedbackEstado,
} from '@/Services/FeedbackService';
import type { EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceSearchResult | null;
  /** Callback para actualizar la tabla tras el envío */
  onSuccess?: (evidenciaId: number, nuevoEstado: FeedbackEstado) => void;
}

const ESTADOS_OPCIONES: RadioCardOption[] = [
  {
    value: 'Observada',
    label: 'Observada',
    description: 'Requiere corrección — el responsable debe subsanar las observaciones.',
    iconBg: 'bg-warning-light',
    icon: (
      <svg className="w-4 h-4 text-warning-dark flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'Validada',
    label: 'Validada',
    description: 'Aprobada formalmente — la evidencia cumple los criterios de evaluación.',
    iconBg: 'bg-verde-light',
    icon: (
      <svg className="w-4 h-4 text-verde-dark flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
    ),
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
        <RadioGroupCards
          name="estado_retroalimentacion"
          value={estado}
          onChange={(val) => {
            setEstado(val as FeedbackEstado);
            setErrors(prev => ({ ...prev, estado: undefined }));
          }}
          options={ESTADOS_OPCIONES}
          label="Estado"
          required
          error={errors.estado}
        />

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
