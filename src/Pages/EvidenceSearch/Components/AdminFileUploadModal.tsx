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

type Tab = 'archivos' | 'enlaces';

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
    tab: Tab; selectedFiles: File[]; selectedLinks: string[];
    resolvedId: number; resolving: boolean; error: boolean;
  }>({ tab: 'archivos', selectedFiles: [], selectedLinks: [], resolvedId: procesoIdProp, resolving: false, error: false });
  const tab = modalState.tab;
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

      setModalState({ tab: 'archivos', selectedFiles: [], selectedLinks: [], resolvedId, resolving: false, error: hasError });
    };
    resolve();
  }, [isOpen, evidenciaId, procesoIdProp]);

  const canSubmit = (): boolean => {
    if (resolveError || resolvingProceso || !resolvedProcesoId) return false;
    if (tab === 'archivos') return selectedFiles.length > 0;
    return selectedLinks.length > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setUploading(true);
    try {
      if (tab === 'archivos') {
        const { successful, failed } = await fileService.uploadMultipleFiles(
          selectedFiles,
          evidenciaId,
          resolvedProcesoId,
        );
        if (failed.length > 0) {
          showToast({
            type: 'warning',
            title: `${successful.length} archivo(s) subidos`,
            message: `${failed.length} no pudieron subirse: ${failed[0].error}`,
          });
        } else {
          showToast({
            type: 'success',
            title: `${successful.length} archivo(s) subidos correctamente`,
          });
        }
      } else {
        const { successful, failed } = await fileService.uploadMultipleLinks(
          selectedLinks,
          evidenciaId,
          resolvedProcesoId,
        );
        if (failed.length > 0) {
          showToast({
            type: 'warning',
            title: `${successful.length} enlace(s) guardados`,
            message: `${failed.length} no pudieron guardarse: ${failed[0].error}`,
          });
        } else {
          showToast({
            type: 'success',
            title: `${successful.length} enlace(s) guardados correctamente`,
          });
        }
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
      size="md"
      footerButtons={
        <>
          <Button
            variant="secondary"
            onClick={() => !uploading && onClose()}
            disabled={uploading}
            standardWidth
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
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
        {/* Tabs archivos / enlaces */}
        <div className="flex gap-1 border-b border-gris-una/20 pb-0">
          {(['archivos', 'enlaces'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setModalState(prev => ({ ...prev, tab: t }))}
              className={`px-4 py-2 capitalize ${TYPOGRAPHY.modal.body} border-b-2 transition-colors ${
                tab === t
                  ? 'border-azul-una text-azul-una font-semibold'
                  : 'border-transparent text-gris-una hover:text-negro-una-2'
              }`}
            >
              {t === 'archivos' ? 'Archivos' : 'Enlaces'}
            </button>
          ))}
        </div>

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

        {/* Contenido según tab */}
        {!resolvingProceso && !resolveError && (
          <>
            {tab === 'archivos' && (
              <DropZone
                onFilesSelected={(files) => setModalState(prev => ({ ...prev, selectedFiles: files }))}
                disabled={uploading}
              />
            )}
            {tab === 'archivos' && selectedFiles.length > 0 && (
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

            {tab === 'enlaces' && (
              <LinkInput
                onLinksChange={(links) => setModalState(prev => ({ ...prev, selectedLinks: links }))}
                disabled={uploading}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
