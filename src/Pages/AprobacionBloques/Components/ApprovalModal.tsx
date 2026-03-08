import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';

interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivo_adjuntado?: boolean;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comentario: string) => void;
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
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setComentario('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!criterio) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comentario);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAprobar = action === 'aprobar';
  const title = isAprobar ? 'Aprobar Criterio' : 'Rechazar Criterio';
  
  const totalEvidencias = evidencias.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      variant={isAprobar ? 'info' : 'danger'}
      showConfirm={true}
      showCancel={true}
      confirmLabel={isAprobar ? 'Aprobar' : 'Rechazar'}
      cancelLabel="Cancelar"
      onConfirm={handleSubmit}
      confirmLoading={isSubmitting}
    >
      <div className="space-y-3">
        {/* Información del Criterio */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-900">{criterio.nomenclatura}</div>
          <div className="text-sm text-gray-500 mt-1">{criterio.descripcion}</div>
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Evidencias asociadas:</span> {totalEvidencias}
          </div>
        </div>

        {/* Mensaje de confirmación */}
        <div className="text-sm text-gray-500">
          {isAprobar ? (
            '¿Está seguro que desea aprobar este criterio? Esta acción quedará registrada en la bitácora del sistema.'
          ) : (
            '¿Está seguro que desea rechazar este criterio? Esta acción quedará registrada en la bitácora del sistema.'
          )}
        </div>

        {/* Campo de Comentario - Opcional */}
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            maxLength={100}
            placeholder={
              isAprobar
                ? 'Agregue un comentario adicional si lo desea...'
                : 'Agregue un comentario sobre esta decisión...'
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            {comentario.length} / 100 caracteres
          </p>
        </div>
      </div>
    </Modal>
  );
};
