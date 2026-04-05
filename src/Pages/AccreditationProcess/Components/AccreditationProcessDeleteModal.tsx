import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { AccreditationProcess } from '@/Types/AccreditationProcessTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  process: AccreditationProcess | null;
  onConfirm: (confirmacion: string) => Promise<void>;
  isLoading?: boolean;
}

export const AccreditationProcessDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  process,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === process?.type;
  const canDelete = isMatch && !isLoading;

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  if (!process) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="danger"
      title="Eliminar proceso de acreditación"
      showCancel={false}
      showConfirm={false}
      footerMeta={
        <span className={cn(TYPOGRAPHY.form.helper, 'text-error')}>
          Acción irreversible
        </span>
      }
      footerButtons={
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={onClose} standardWidth>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            disabled={!canDelete}
            isLoading={isLoading}
            standardWidth
            onClick={() => canDelete && onConfirm(confirmText)}
          >
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          ¿Está seguro de eliminar el proceso{' '}
          <span className="font-bold text-negro-una">"{process.type}"</span>?
          Esta acción no puede deshacerse.
        </p>

        <div className="mt-1">
          <div className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 mb-2 flex flex-wrap items-center gap-1.5')}>
            <span>Para confirmar, escribe el tipo de proceso exacto:</span>
            <span className={cn(TYPOGRAPHY.modal.body, 'text-error font-bold')}>
              {process.type}
            </span>
          </div>
          <Input
            label="Confirmar tipo de proceso"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={process.type}
            error={confirmText.length > 0 && !isMatch ? 'El texto no coincide' : undefined}
          />
        </div>
      </div>
    </Modal>
  );
};
