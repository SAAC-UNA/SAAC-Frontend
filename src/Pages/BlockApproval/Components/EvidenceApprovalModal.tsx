import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

interface EvidenceApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comentario?: string, nuevaFechaLimite?: string) => void;
  action: 'aprobar' | 'rechazar';
  criterio: { nomenclatura: string; descripcion: string } | null;
  evidencia: { nomenclatura: string; descripcion: string } | null;
}

export const EvidenceApprovalModal: React.FC<EvidenceApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  criterio,
  evidencia,
}) => {
  const [comment, setComment] = useState('');
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setNuevaFechaLimite('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!criterio || !evidencia) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment || undefined, nuevaFechaLimite || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAprobar = action === 'aprobar';
  const title = isAprobar ? 'Aprobar Evidencia' : 'Rechazar Evidencia';
  const subtitle = `${evidencia.nomenclatura} - ${evidencia.descripcion}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="md"
      variant={isAprobar ? 'info' : 'danger'}
      showConfirm
      showCancel
      confirmLabel={isAprobar ? 'Sí, aprobar' : 'Sí, rechazar'}
      cancelLabel="Cancelar"
      onConfirm={handleSubmit}
      confirmLoading={isSubmitting}
    >
      <div className="flex flex-col gap-3">

        {/* Confirmación */}
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          {isAprobar
            ? '¿Está seguro que desea aprobar esta evidencia?'
            : '¿Está seguro que desea rechazar esta evidencia? El responsable recibirá una notificación y deberá reenviarla.'}
        </p>

        {/* Comentario (opcional para aprobar, recomendado para rechazar) */}
        <Textarea
          label="Comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          characterCount
          placeholder={
            isAprobar
              ? 'Agregue un comentario si lo desea...'
              : 'Agregue un comentario sobre el rechazo...'
          }
        />

        {/* Nueva fecha límite (solo al rechazar) */}
        {!isAprobar && (
          <DatePicker
            label="Nueva fecha límite (opcional)"
            value={nuevaFechaLimite}
            onChange={(value) => setNuevaFechaLimite(value)}
            minDate={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            helperText="Si se indica, la fecha límite del responsable será actualizada"
          />
        )}

      </div>
    </Modal>
  );
};
