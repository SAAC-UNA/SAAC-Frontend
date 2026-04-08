/**
 * ElementUploadPage - Subida de recursos para pautas (modelo flexible)
 * Equivalente a EvidenceUploadPage pero usa el endpoint /api/elementos-archivos.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';
import {
  FileUploader,
  FileUploadProgress,
  FileList,
} from '@/Components/Ui/Upload';
import type { FileUploadProgressItem } from '@/Components/Ui/Upload';
import { LinkInput } from '@/Components/Ui/Forms/LinkInput';
import { LoadingSpinner } from '@/Components/Ui/Index';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { FileModel } from '@/Types/FileTypes';

interface ElementUploadPageProps {
  isOpen: boolean;
  onClose: () => void;
  elementoId: number;
  procesoId: number;
  nombre: string;
  onSuccess?: () => void;
}

export const ElementUploadPage: React.FC<ElementUploadPageProps> = ({
  isOpen,
  onClose,
  elementoId,
  procesoId,
  nombre,
  onSuccess,
}) => {

  const { showToast } = useToast();

  const [uploadState, setUploadState] = useState<{
    selectedFiles: File[];
    selectedLinks: string[];
    uploadProgress: FileUploadProgressItem[];
    isUploading: boolean;
    uploaderKey: number;
  }>({
    selectedFiles: [],
    selectedLinks: [],
    uploadProgress: [],
    isUploading: false,
    uploaderKey: 0,
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen) loadFiles();
  }, [isOpen, elementoId, procesoId]);

  const loadFiles = async () => {
    if (!elementoId || !procesoId) return;
    try {
      setLoadingFiles(true);
      const files = await evidenceAssignmentService.getElementFiles(elementoId, procesoId);
      setUploadedFiles(files);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al cargar archivos',
        message: error.message || 'No se pudieron cargar los archivos existentes',
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleStartUpload = async () => {
    const { selectedFiles, selectedLinks } = uploadState;
    if (!elementoId || !procesoId) {
      showToast({ type: 'error', title: 'Información incompleta', message: 'Faltan parámetros de pauta o proceso' });
      return;
    }
    if (selectedFiles.length === 0 && selectedLinks.length === 0) {
      showToast({ type: 'warning', title: 'Nada seleccionado', message: 'Seleccione archivos o agregue enlaces' });
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      uploadProgress: selectedFiles.map((file) => ({ file, status: 'pending', progress: 0 })),
    }));

    try {
      let totalSuccess = 0;
      let totalFailed  = 0;
      let firstError   = '';

      if (selectedFiles.length > 0) {
        setUploadState((prev) => ({
          ...prev,
          uploadProgress: prev.uploadProgress.map((item) => ({ ...item, status: 'uploading', progress: 50 })),
        }));

        const { successful, failed } = await evidenceAssignmentService.uploadElementFiles(
          selectedFiles, elementoId, procesoId,
        );
        totalSuccess += successful.length;
        totalFailed  += failed.length;
        if (failed.length > 0) firstError = failed[0].error;

        setUploadState((prev) => ({
          ...prev,
          uploadProgress: prev.uploadProgress.map((item, i) => {
            const isSuccess = i < successful.length;
            return { ...item, status: isSuccess ? 'success' : 'error', progress: isSuccess ? 100 : 0 };
          }),
        }));
      }

      if (selectedLinks.length > 0) {
        const { successful, failed } = await evidenceAssignmentService.uploadElementLinks(
          selectedLinks, elementoId, procesoId,
        );
        totalSuccess += successful.length;
        totalFailed  += failed.length;
        if (failed.length > 0 && !firstError) firstError = failed[0].error;
      }

      if (totalFailed > 0 && totalSuccess > 0) {
        showToast({ type: 'warning', title: `${totalSuccess} recurso(s) guardados`, message: `${totalFailed} no pudieron guardarse: ${firstError}` });
      } else if (totalFailed > 0) {
        showToast({ type: 'error', title: 'Error al subir', message: firstError || 'No se pudo completar la operación' });
      } else {
        showToast({ type: 'success', title: `${totalSuccess} recurso(s) guardados correctamente` });
      }

      if (totalSuccess > 0) {
        await loadFiles();
        onSuccess?.();
      }

      if (totalFailed === 0) {
        setUploadState((prev) => ({
          ...prev,
          selectedFiles: [],
          selectedLinks: [],
          uploaderKey: prev.uploaderKey + 1,
        }));
        setTimeout(() => setUploadState((prev) => ({ ...prev, uploadProgress: [] })), 3000);
      }
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al subir', message: error.message || 'Ocurrió un error durante la subida' });
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item) => ({ ...item, status: 'error', error: error.message })),
      }));
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await evidenceAssignmentService.deleteElementFile(fileId);
      showToast({ type: 'success', title: 'Archivo eliminado' });
      await loadFiles();
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al eliminar', message: error.message });
    }
  };

  const { selectedFiles, selectedLinks, uploadProgress, isUploading, uploaderKey } = uploadState;

  const handleClose = () => {
    if (!isUploading) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Subir recursos — ${nombre}`}
      size="xl"
      footerButtons={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isUploading} standardWidth>
            Cerrar
          </Button>
          {(selectedFiles.length > 0 || selectedLinks.length > 0) && !isUploading && (
            <>
              <Button variant="secondary" onClick={handleStartUpload} standardWidth>
                Subir
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Archivos */}
        <div>
          <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-2`}>
            Seleccione archivos
          </h2>
          <FileUploader
            key={`file-uploader-${uploaderKey}`}
            onFilesSelected={(files) => setUploadState((prev) => ({ ...prev, selectedFiles: files }))}
            disabled={isUploading}
          />
        </div>

        {/* Enlaces */}
        <div>
          <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-2`}>
            Enlaces externos
          </h2>
          <LinkInput
            key={`link-input-${uploaderKey}`}
            onLinksChange={(links) => setUploadState((prev) => ({ ...prev, selectedLinks: links }))}
            disabled={isUploading}
            className="w-full"
          />
        </div>

        {/* Progreso */}
        {uploadProgress.length > 0 && (
          <FileUploadProgress files={uploadProgress} />
        )}

        {/* Archivos subidos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2`}>
              Archivos subidos
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loadingFiles}>
                  {SystemIcons.interface.refresh({ size: 'sm', className: loadingFiles ? 'animate-spin' : '' })}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Actualizar lista</TooltipContent>
            </Tooltip>
          </div>
          {loadingFiles ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : (
            <FileList files={uploadedFiles} onDelete={handleDeleteFile} />
          )}
        </div>
      </div>
    </Modal>
  );
};
