/**
 * StructureModelDeleteModal - Modal de eliminación con confirmación por nombre.
 *
 * El backend requiere que se envíe el nombre exacto del modelo en el campo
 * "confirmacion" para proceder con la eliminación (patrón GitHub-style).
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Input } from '@/Components/Ui/Forms/Input';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { StructureModel } from '@/Types/StructureModelTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model: StructureModel | null;
  onConfirm: (confirmacion: string) => Promise<void>;
  isLoading?: boolean;
}

export const StructureModelDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  model,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === model?.nombre;

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  if (!model) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(confirmText)}
      variant="danger"
      title="Eliminar modelo de acreditación"
      confirmLabel="Eliminar definitivamente"
      cancelLabel="Cancelar"
      confirmLoading={isLoading}
      showCancel
      showConfirm
      footerMeta="Esta acción es irreversible"
    >
      <div className="flex flex-col gap-3">
        <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
          ¿Está seguro de eliminar el modelo{' '}
          <span className="font-bold text-negro-una">"{model.nombre}"</span>?
          Se eliminarán todos los elementos que definen su estructura.
        </p>

        <div className="p-3 bg-red-50 border border-red-200 rounded-corner text-sm text-red-700">
          <strong>Bloqueado si:</strong> el modelo tiene ciclos de acreditación asociados.
        </div>

        <div className="mt-1">
          <p className={cn(TYPOGRAPHY.form.helper, 'text-gris-una-2 mb-2')}>
            Para confirmar, escribe el nombre exacto del modelo:
          </p>
          <p className="text-xs font-mono bg-gray-100 border rounded px-2 py-1 mb-2 select-all">
            {model.nombre}
          </p>
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
