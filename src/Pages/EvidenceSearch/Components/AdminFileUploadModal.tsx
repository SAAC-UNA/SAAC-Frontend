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

  const [tab, setTab] = useState<Tab>('archivos');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resolvedProcesoId, setResolvedProcesoId] = useState<number>(procesoIdProp);
  const [resolvingProceso, setResolvingProceso] = useState(false);
  const [resolveError, setResolveError] = useState(false);

  // Cuando abre el modal, resolver proceso_id si aún no se tiene
  useEffect(() => {
    if (!isOpen) return;
    setSelectedFiles([]);
    setSelectedLinks([]);
    setResolveError(false);
    setTab('archivos');

    if (procesoIdProp && procesoIdProp !== 0) {
      setResolvedProcesoId(procesoIdProp);
      return;
    }

    // Obtener desde las asignaciones de la evidencia
    setResolvingProceso(true);
    axiosInstance
      .get(`/evidencias/${evidenciaId}/asignaciones`)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const first = Array.isArray(data) ? data[0] : null;
        const pid = first?.proceso_id ?? first?.proceso?.proceso_id ?? 0;
        if (pid) {
          setResolvedProcesoId(pid);
        } else {
          setResolveError(true);
        }
      })
      .catch(() => setResolveError(true))
      .finally(() => setResolvingProceso(false));
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
              onClick={() => setTab(t)}
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
                onFilesSelected={setSelectedFiles}
                disabled={uploading}
              />
            )}
            {tab === 'archivos' && selectedFiles.length > 0 && (
              <ul className={`space-y-1 ${TYPOGRAPHY.modal.body}`}>
                {selectedFiles.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-negro-una-2">
                    <span className="truncate max-w-xs">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}
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
                onLinksChange={setSelectedLinks}
                disabled={uploading}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
