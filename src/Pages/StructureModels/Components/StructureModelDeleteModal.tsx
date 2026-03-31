/**
 * StructureModelDeleteModal - Modal de eliminación con confirmación por nombre.
 *
 * El backend requiere que se envíe el nombre exacto del modelo en el campo
 * "confirmacion" para proceder con la eliminación (patrón GitHub-style).
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Button } from '@/Components/Ui/Buttons/Button';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { StructureModel } from '@/Types/StructureModelTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model: StructureModel | null;
  onConfirm: (confirmacion: string) => Promise<void>;
  isLoading?: boolean;
  /** Si el modelo tiene ciclos de acreditación asociados, se bloquea la eliminación */
  hasCiclos?: boolean;
}

export const StructureModelDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  model,
  onConfirm,
  isLoading = false,
  hasCiclos = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === model?.nombre;
  const canDelete = isMatch && !hasCiclos && !isLoading;

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  if (!model) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="danger"
      title="Eliminar modelo de acreditación"
      showCancel={false}
      showConfirm={false}
      footerMeta={
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
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
          ¿Está seguro de eliminar el modelo{' '}
          <span className="font-bold text-negro-una">"{model.nombre}"</span>?
          Se eliminarán todos los elementos que definen su estructura.
        </p>

        <div className="mt-1">
          <div className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 mb-2 flex flex-wrap items-center gap-1.5')}>
            <span>Para confirmar, escribe el nombre exacto del modelo:</span>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono font-bold border border-gray-200 select-all cursor-text">
              {model.nombre}
            </span>
          </div>
          <Input
            label="Confirmar nombre"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={model.nombre}
            error={confirmText.length > 0 && !isMatch ? 'El nombre no coincide' : undefined}
          />
        </div>
      </div>
    </Modal>
  );
};
