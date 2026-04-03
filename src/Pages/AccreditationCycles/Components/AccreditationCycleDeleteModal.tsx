/**
 * AccreditationCycleDeleteModal - Modal de eliminación con confirmación por nombre.
 *
 * El backend requiere enviar el nombre exacto del ciclo en el campo
 * "confirmacion" para proceder con la eliminación.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { AccreditationCycle } from '@/Types/AccreditationCycleTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cycle: AccreditationCycle | null;
  onConfirm: (confirmacion: string) => Promise<void>;
  isLoading?: boolean;
}

export const AccreditationCycleDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cycle,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === cycle?.nombre;
  const canDelete = isMatch && !isLoading;

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  if (!cycle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="danger"
      title="Eliminar ciclo de acreditación"
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
            Sí, eliminar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          ¿Está seguro de eliminar el ciclo{' '}
          <span className="font-bold text-negro-una">"{cycle.nombre}"</span>?
          Esta acción no puede deshacerse.
        </p>

        <div className="mt-1">
          <div className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 mb-2 flex flex-wrap items-center gap-1.5')}>
            <span>Para confirmar, escribe el nombre exacto del ciclo:</span>
            <span className={cn(TYPOGRAPHY.modal.body, 'text-error font-bold')}>
              {cycle.nombre}
            </span>
          </div>
          <Input
            label="Confirmar nombre"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={cycle.nombre}
            error={confirmText.length > 0 && !isMatch ? 'El nombre no coincide' : undefined}
          />
        </div>
      </div>
    </Modal>
  );
};
