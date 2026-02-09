import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modal';

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
  onConfirm: (comentario: string, forzarAprobacion?: boolean) => void;
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
  const [acceptIncomplete, setAcceptIncomplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setComentario('');
      setIsSubmitting(false);
      setAcceptIncomplete(false);
    }
  }, [isOpen]);

  if (!criterio) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comentario, acceptIncomplete);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAprobar = action === 'aprobar';
  const title = isAprobar ? 'Aprobar Criterio' : 'Rechazar Criterio';
  
  // Calcular evidencias con archivos adjuntos
  const evidenciasConArchivos = evidencias.filter(e => e.archivo_adjuntado).length;
  const totalEvidencias = evidencias.length;
  const bloqueIncompleto = evidenciasConArchivos < totalEvidencias;
  
  // El botón de aprobar solo se habilita si:
  // - No es aprobar, o
  // - El bloque está completo, o
  // - El bloque está incompleto pero se aceptó el checkbox
  const canConfirm = !isAprobar || !bloqueIncompleto || acceptIncomplete;

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
      confirmDisabled={!canConfirm}
    >
      <div className="space-y-3">
        {/* Información del Criterio */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-900">{criterio.nomenclatura}</div>
          <div className="text-sm text-gray-500 mt-1">{criterio.descripcion}</div>
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Evidencias asociadas:</span> {evidenciasConArchivos} de {totalEvidencias}
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

        {/* Checkbox para aprobar bloque incompleto */}
        {isAprobar && bloqueIncompleto && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <input
                id="accept-incomplete"
                type="checkbox"
                checked={acceptIncomplete}
                onChange={(e) => setAcceptIncomplete(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
              />
              <span className="ml-3 text-sm text-red-700 select-none">
                Al hacer click aquí, da su visto bueno para aprobar un bloque incompleto
              </span>
            </div>
          </div>
        )}

        {/* Campo de Comentario - Solo para rechazar */}
        {!isAprobar && (
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
              maxLength={500}
              placeholder="Agregue un comentario sobre esta decisión..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {comentario.length} / 500 caracteres
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
