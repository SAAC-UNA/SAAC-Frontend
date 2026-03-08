/**
 * FileUploader - Zona de selecci�n + lista de archivos pre-subida
 * Orquestra DropZone (UI) + validaci�n + lista editable de archivos seleccionados.
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState, useCallback } from 'react';
import {
  validateFile,
  formatFileSize,
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILES_PER_UPLOAD,
} from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Button } from '@/Components/Ui/Buttons/Button';
import { useToast } from '@/Context/ToastContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Feedback/Tooltip';
import { TYPOGRAPHY } from '@/constants/Typography';
import { DropZone } from './DropZone';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = MAX_FILES_PER_UPLOAD,
  disabled = false,
  accept = [
    ...ALLOWED_FILE_EXTENSIONS.map(ext => `.${ext}`),
    ...ALLOWED_MIME_TYPES,
  ].join(','),
  className = '',
}) => {
  const { showToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleNewFiles = useCallback(
    (rawFiles: File[]) => {
      if (rawFiles.length === 0) return;

      const newErrors: Record<string, string> = {};
      const validFiles: File[] = [];

      rawFiles.forEach((file) => {
        const validation = validateFile(file);
        if (!validation.isValid) {
          newErrors[file.name] = validation.error ?? 'Error de validación';
        } else {
          validFiles.push(file);
        }
      });

      // Mostrar toast por cada archivo rechazado
      const rejectedNames = Object.keys(newErrors);
      if (rejectedNames.length > 0) {
        showToast({
          type: 'error',
          title: rejectedNames.length === 1
            ? 'Archivo no permitido'
            : `${rejectedNames.length} archivos no permitidos`,
          message: rejectedNames.length === 1
            ? newErrors[rejectedNames[0]]
            : `Formatos no permitidos: ${rejectedNames.join(', ')}`,
        });
      }

      if (selectedFiles.length + validFiles.length > maxFiles) {
        showToast({
          type: 'error',
          title: 'Límite de archivos excedido',
          message: `No puede seleccionar más de ${maxFiles} archivos a la vez.`,
        });
        return;
      }

      setValidationErrors(newErrors);

      if (validFiles.length > 0) {
        const updated = [...selectedFiles, ...validFiles];
        setSelectedFiles(updated);
        onFilesSelected(updated);
      }
    },
    [selectedFiles, maxFiles, onFilesSelected, showToast],
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updated);
      onFilesSelected(updated);
      const fileName = selectedFiles[index].name;
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fileName];
        return next;
      });
    },
    [selectedFiles, onFilesSelected],
  );

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setValidationErrors({});
    onFilesSelected([]);
  }, [onFilesSelected]);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Zona de arrastre y diseño Untitled UI */}
      <DropZone
        onFilesSelected={handleNewFiles}
        disabled={disabled}
        accept={accept}
        maxFiles={maxFiles}
      />

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`${TYPOGRAPHY.form.label} font-medium text-negro-una-2`}>
              Archivos seleccionados ({selectedFiles.length}/{maxFiles})
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              <span className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Limpiar todo</span>
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-blanco-una rounded-corner border border-gris-una/20"
              >
                {/* ícono */}
                {SystemIcons.modal.document({ size: 'lg', className: 'text-azul-una flex-shrink-0' })}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`${TYPOGRAPHY.body} font-medium text-negro-una-2 truncate`}>
                    {file.name}
                  </p>
                  <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
                    {formatFileSize(file.size)}
                  </p>
                  {validationErrors[file.name] && (
                    <p className={`${TYPOGRAPHY.form.helper} text-rojo-una mt-0.5`}>
                      {validationErrors[file.name]}
                    </p>
                  )}
                </div>

                {/* Eliminar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    >
                      {SystemIcons.actions.cancel({ size: 'md', className: 'text-rojo-una' })}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Eliminar archivo</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};