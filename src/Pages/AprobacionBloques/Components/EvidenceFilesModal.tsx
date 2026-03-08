/**
 * EvidenceFilesModal - Modal para mostrar archivos asociados a una evidencia
 * HU010 - Aprobación por Bloques
 */

import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
}

interface EvidenceFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencia: Evidencia | null;
}

export const EvidenceFilesModal: React.FC<EvidenceFilesModalProps> = ({
  isOpen,
  onClose,
  evidencia
}) => {
  if (!evidencia) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archivos asociados a esta evidencia"
      size="md"
      closable
    >
      <div className="space-y-4">
        {/* Información de la evidencia */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-900">{evidencia.nomenclatura}</div>
          <div className="text-sm text-gray-500 mt-1">{evidencia.descripcion}</div>
        </div>

        {/* Lista de archivos - Por ahora vacío */}
        <div className="border border-gray-200 rounded-md p-8">
          <div className="text-center">
            <SystemIcons.modal.document className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay archivos asociados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Esta evidencia aún no tiene archivos adjuntos.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
