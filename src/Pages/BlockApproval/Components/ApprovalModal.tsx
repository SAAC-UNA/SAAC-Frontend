import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  linked_count?: number;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comentario: string, nuevaFechaLimite?: string) => void;
  action: 'aprobar' | 'rechazar';
  isFlexible?: boolean;
  criterio: Criterio | null;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  criterio
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

  if (!criterio) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment, nuevaFechaLimite || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAprobar = action === 'aprobar';
  const title = isAprobar ? 'Aprobar Bloque' : 'Rechazar Bloque';
  const subtitle = `${criterio.nomenclatura} - ${criterio.descripcion}`;

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

        {/* Pregunta de confirmación */}
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          {isAprobar
            ? '¿Está seguro que desea aprobar este bloque? Todas las evidencias pendientes serán aprobadas en cascada.'
            : '¿Está seguro que desea rechazar este bloque? Todas las evidencias serán marcadas como rechazadas.'}
        </p>

        {/* Comentario (solo al rechazar) */}
        {!isAprobar && (
          <Textarea
            label="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={100}
            characterCount
            placeholder="Agregue un comentario sobre el rechazo..."
          />
        )}

        {/* Nueva fecha límite (solo al rechazar) */}
        {!isAprobar && (
          <DatePicker
            label="Nueva fecha límite (opcional)"
            value={nuevaFechaLimite}
            onChange={(value) => setNuevaFechaLimite(value)}
            minDate={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            helperText="Si se indica, la fecha límite de todas las evidencias será actualizada"
          />
        )}

      </div>
    </Modal>
  );
};
