import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { Input } from '@/Components/Ui/Forms/Input';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAprobar ? 'Aprobar Evidencia' : 'Rechazar Evidencia'}
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
            ? '¿Está seguro que desea aprobar esta evidencia individualmente?'
            : '¿Está seguro que desea rechazar esta evidencia? El responsable recibirá una notificación y deberá reenviarla.'}
        </p>

        {/* Información */}
        <div className="flex flex-col gap-1 border-l-2 border-gris-light pl-3">
          <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una')}>
            Criterio: <span className="font-semibold text-negro-una">{criterio.nomenclatura}</span>
          </span>
          <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
            {evidencia.nomenclatura}
          </span>
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {evidencia.descripcion}
          </span>
        </div>

        {/* Comentario (opcional para aprobar, recomendado para rechazar) */}
        <Textarea
          label={isAprobar ? 'Comentario (opcional)' : 'Observación (opcional)'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          characterCount
          placeholder={
            isAprobar
              ? 'Agregue un comentario si lo desea...'
              : 'Indique el motivo del rechazo o los ajustes necesarios...'
          }
        />

        {/* Nueva fecha límite (solo al rechazar) */}
        {!isAprobar && (
          <Input
            label="Nueva fecha límite (opcional)"
            type="date"
            value={nuevaFechaLimite}
            onChange={(e) => setNuevaFechaLimite(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            helperText="Si se indica, se actualizará la fecha límite del responsable"
          />
        )}

      </div>
    </Modal>
  );
};
