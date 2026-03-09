/**
 * useFileUpload - Hook para gestionar la selección y validación de archivos pre-subida
 * HU008 - Subida de Evidencias al Sistema
 */

import { useState, useCallback } from 'react';
import { validateFile, MAX_FILES_PER_UPLOAD } from '@/Types/FileTypes';
import { useToast } from '@/Context/ToastContext';

export interface UseFileUploadReturn {
  files: File[];
  errors: Record<string, string>;
  addFiles: (rawFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearAll: () => void;
}

export function useFileUpload(
  onFilesChanged: (files: File[]) => void,
  maxFiles: number = MAX_FILES_PER_UPLOAD,
): UseFileUploadReturn {
  const { showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFiles = useCallback(
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

      const rejected = Object.keys(newErrors);
      if (rejected.length > 0) {
        showToast({
          type: 'error',
          title: rejected.length === 1 ? 'Archivo no permitido' : `${rejected.length} archivos no permitidos`,
          message: rejected.length === 1
            ? newErrors[rejected[0]]
            : `Formatos no permitidos: ${rejected.join(', ')}`,
        });
      }

      if (files.length + validFiles.length > maxFiles) {
        showToast({
          type: 'error',
          title: 'Límite de archivos excedido',
          message: `No puede seleccionar más de ${maxFiles} archivos a la vez.`,
        });
        return;
      }

      setErrors(newErrors);

      if (validFiles.length > 0) {
        const updated = [...files, ...validFiles];
        setFiles(updated);
        onFilesChanged(updated);
      }
    },
    [files, maxFiles, onFilesChanged, showToast],
  );

  const removeFile = useCallback(
    (index: number) => {
      const removed = files[index];
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      onFilesChanged(updated);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[removed.name];
        return next;
      });
    },
    [files, onFilesChanged],
  );

  const clearAll = useCallback(() => {
    setFiles([]);
    setErrors({});
    onFilesChanged([]);
  }, [onFilesChanged]);

  return { files, errors, addFiles, removeFile, clearAll };
}
