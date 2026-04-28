/**
 * AdminFileUploadModal - Subida de archivos en nombre de un usuario
 * !Exclusivo para Superusuario / Administrador desde EvidenceDetailsModal
 *
 * Resuelve proceso_id automáticamente:
 *   1. Desde los archivos ya existentes de la evidencia (si los hay)
 *   2. Desde el primer registro en GET /evidencias/{id}/asignaciones
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button } from '@/Components/Ui/Buttons/Button';
import { DropZone } from '@/Components/Ui/Upload/DropZone';
import { LinkInput } from '@/Components/Ui/Forms/LinkInput';
import { fileService } from '@/Services/FileService';
import { axiosInstance } from '@/Config/axios';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface AdminFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenciaId: number;
  /** proceso_id ya conocido (extraído de archivos existentes). 0 = desconocido. */
  procesoId: number;
  onSuccess: () => void;
}

export const AdminFileUploadModal: React.FC<AdminFileUploadModalProps> = ({
  isOpen,
  onClose,
  evidenciaId,
  procesoId: procesoIdProp,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    selectedFiles: File[]; selectedLinks: string[];
    resolvedId: number; resolving: boolean; error: boolean;
  }>({ selectedFiles: [], selectedLinks: [], resolvedId: procesoIdProp, resolving: false, error: false });
  const selectedFiles = modalState.selectedFiles;
  const selectedLinks = modalState.selectedLinks;
  const resolvedProcesoId = modalState.resolvedId;
  const resolvingProceso = modalState.resolving;
  const resolveError = modalState.error;
  const [uploading, setUploading] = useState(false);

  // Cuando abre el modal, resolver proceso_id si aún no se tiene
  useEffect(() => {
    if (!isOpen) return;
    const resolve = async () => {
      let resolvedId = procesoIdProp && procesoIdProp !== 0 ? procesoIdProp : 0;
      let hasError = false;

      if (!resolvedId) {
        try {
          const res = await axiosInstance.get(`/evidencias/${evidenciaId}/asignaciones`);
          const data = res.data?.data ?? res.data ?? [];
          const first = Array.isArray(data) ? data[0] : null;
          resolvedId = first?.proceso_id ?? first?.proceso?.proceso_id ?? 0;
          hasError = !resolvedId;
        } catch {
          hasError = true;
        }
      }

      setModalState({ selectedFiles: [], selectedLinks: [], resolvedId, resolving: false, error: hasError });
    };
    resolve();
  }, [isOpen, evidenciaId, procesoIdProp]);

  const canSubmit = (): boolean => {
    if (resolveError || resolvingProceso || !resolvedProcesoId) return false;
    return selectedFiles.length > 0 || selectedLinks.length > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setUploading(true);
    try {
      const results: { type: string; successful: number; failed: number; error?: string }[] = [];

      if (selectedFiles.length > 0) {
        const { successful, failed } = await fileService.uploadMultipleFiles(
          selectedFiles,
          evidenciaId,
          resolvedProcesoId,
        );
        results.push({ type: 'archivos', successful: successful.length, failed: failed.length, error: failed[0]?.error });
      }

      if (selectedLinks.length > 0) {
        const { successful, failed } = await fileService.uploadMultipleLinks(
          selectedLinks,
          evidenciaId,
          resolvedProcesoId,
        );
        results.push({ type: 'enlaces', successful: successful.length, failed: failed.length, error: failed[0]?.error });
      }

      const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);
      const totalSuccess = results.reduce((acc, r) => acc + r.successful, 0);

      if (totalFailed > 0) {
        showToast({
          type: 'warning',
          title: `${totalSuccess} recurso(s) guardados`,
          message: `${totalFailed} no pudieron guardarse: ${results.find(r => r.failed > 0)?.error}`,
        });
      } else {
        showToast({
          type: 'success',
          title: `${totalSuccess} recurso(s) guardados correctamente`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al subir',
        message: error.message || 'No se pudo completar la operación.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !uploading && onClose()}
      title="Agregar recursos a evidencia"
      variant="upload"
      size="md"
      footerButtons={
        <>
          <Button
            variant="outline"
            onClick={() => !uploading && onClose()}
            disabled={uploading}
            standardWidth
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmit}
            disabled={!canSubmit() || uploading}
            isLoading={uploading}
            standardWidth
          >
            Subir
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        {/* Estado de resolución de proceso */}
        {resolvingProceso && (
          <p className={`text-gris-una ${TYPOGRAPHY.modal.body}`}>
            Obteniendo información del proceso...
          </p>
        )}
        {resolveError && (
          <p className={`text-rojo-una ${TYPOGRAPHY.modal.body}`}>
            No se encontró un proceso activo para esta evidencia. No es posible subir archivos.
          </p>
        )}

        {!resolvingProceso && !resolveError && (
          <>
            {/* Archivos */}
            <div className="flex flex-col gap-2">
              <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Archivos</span>
              <DropZone
                onFilesSelected={(files) => setModalState(prev => ({ ...prev, selectedFiles: files }))}
                disabled={uploading}
              />
              {selectedFiles.length > 0 && (
                <ul className={`space-y-1 ${TYPOGRAPHY.modal.body}`}>
                  {selectedFiles.map((f, i) => (
                    <li key={f.name} className="flex items-center justify-between text-negro-una-2">
                      <span className="truncate max-w-xs">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setModalState(prev => ({ ...prev, selectedFiles: prev.selectedFiles.filter((_, j) => j !== i) }))}
                        className="text-gris-una hover:text-rojo-una ml-2 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Enlaces */}
            <div className="flex flex-col gap-2">
              <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Enlaces</span>
              <LinkInput
                onLinksChange={(links) => setModalState(prev => ({ ...prev, selectedLinks: links }))}
                disabled={uploading}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
