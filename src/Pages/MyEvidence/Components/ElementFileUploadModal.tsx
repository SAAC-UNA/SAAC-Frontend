import React, { useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { Button } from '@/Components/Ui/Buttons/Button';
import { DropZone } from '@/Components/Ui/Upload/DropZone';
import { LinkInput } from '@/Components/Ui/Forms/LinkInput';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface ElementFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementoId: number;
  procesoId: number;
  elementoNombre: string;
  onSuccess: () => void;
}

export const ElementFileUploadModal: React.FC<ElementFileUploadModalProps> = ({
  isOpen,
  onClose,
  elementoId,
  procesoId,
  elementoNombre,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const canSubmit = !uploading && (selectedFiles.length > 0 || selectedLinks.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setUploading(true);
    try {
      const results: { type: string; successful: number; failed: number; error?: string }[] = [];

      if (selectedFiles.length > 0) {
        const { successful, failed } = await evidenceAssignmentService.uploadElementFiles(
          selectedFiles, elementoId, procesoId,
        );
        results.push({ type: 'archivos', successful: successful.length, failed: failed.length, error: failed[0]?.error });
      }

      if (selectedLinks.length > 0) {
        const { successful, failed } = await evidenceAssignmentService.uploadElementLinks(
          selectedLinks, elementoId, procesoId,
        );
        results.push({ type: 'enlaces', successful: successful.length, failed: failed.length, error: failed[0]?.error });
      }

      const totalFailed   = results.reduce((acc, r) => acc + r.failed, 0);
      const totalSuccess  = results.reduce((acc, r) => acc + r.successful, 0);

      if (totalFailed > 0) {
        showToast({
          type: 'warning',
          title: `${totalSuccess} recurso(s) guardados`,
          message: `${totalFailed} no pudieron guardarse: ${results.find(r => r.failed > 0)?.error}`,
        });
      } else {
        showToast({ type: 'success', title: `${totalSuccess} recurso(s) guardados correctamente` });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al subir', message: error.message || 'No se pudo completar la operación.' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Subir recursos"
      size="md"
      footerButtons={
        <>
          <Button variant="outline" onClick={handleClose} disabled={uploading} standardWidth>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={handleSubmit} disabled={!canSubmit} isLoading={uploading} standardWidth>
            Subir
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <p className={`text-gris-una-2 ${TYPOGRAPHY.modal.body}`}>
          <span className="font-semibold text-negro-una-2">{elementoNombre}</span>
        </p>

        {/* Archivos */}
        <div className="flex flex-col gap-2">
          <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Archivos</span>
          <DropZone
            onFilesSelected={setSelectedFiles}
            disabled={uploading}
          />
          {selectedFiles.length > 0 && (
            <ul className={`space-y-1 ${TYPOGRAPHY.modal.body}`}>
              {selectedFiles.map((f, i) => (
                <li key={f.name} className="flex items-center justify-between text-negro-una-2">
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
        </div>

        <hr className="border-gray-200" />

        {/* Enlaces */}
        <div className="flex flex-col gap-2">
          <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.modal.body}`}>Enlaces</span>
          <LinkInput onLinksChange={setSelectedLinks} disabled={uploading} />
        </div>
      </div>
    </Modal>
  );
};
