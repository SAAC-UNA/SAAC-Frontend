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
}

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id?: number;
  archivo_adjuntado?: boolean;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comentario: string, nuevaFechaLimite?: string) => void;
  action: 'aprobar' | 'rechazar';
  criterio: Criterio | null;
  evidencias: Evidencia[];
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  criterio,
  evidencias
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
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

        {/* Información del criterio */}
        <div className="flex flex-col gap-0.5 border-l-2 border-gris-light pl-3">
          <span className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>
            {criterio.nomenclatura}
          </span>
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
            {criterio.descripcion}
          </span>
          <span className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una mt-1')}>
            {evidencias.length} {evidencias.length === 1 ? 'evidencia asociada' : 'evidencias asociadas'}
          </span>
        </div>

        {/* Comentario */}
        <Textarea
          label="Comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          characterCount
          placeholder={
            isAprobar
              ? 'Agregue un comentario adicional si lo desea...'
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
            helperText="Si se indica, la fecha límite de todas las evidencias será actualizada"
          />
        )}

      </div>
    </Modal>
  );
};
