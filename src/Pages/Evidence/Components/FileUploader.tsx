/**
 * FileUploader - Componente para subir archivos con drag-and-drop
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  validateFile,
  formatFileSize,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD
} from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { useToast } from '@/Context/ToastContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Tooltip';

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
  accept = ALLOWED_FILE_EXTENSIONS.map(ext => `.${ext}`).join(','),
  className = ''
}) => {
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newErrors: Record<string, string> = {};
    const validFiles: File[] = [];

    // Validar cada archivo
    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        newErrors[file.name] = validation.error || 'Error de validación';
      } else {
        validFiles.push(file);
      }
    });

    // Verificar límite de archivos
    if (selectedFiles.length + validFiles.length > maxFiles) {
      showToast({
        type: 'error',
        title: 'Límite de archivos excedido',
        message: `No puede seleccionar más de ${maxFiles} archivos a la vez.`
      });
      return;
    }

    setValidationErrors(newErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  }, [selectedFiles, maxFiles, onFilesSelected, showToast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const { files } = e.dataTransfer;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeFile = useCallback((index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
    
    // Limpiar errores relacionados con ese archivo
    const fileName = selectedFiles[index].name;
    const newErrors = { ...validationErrors };
    delete newErrors[fileName];
    setValidationErrors(newErrors);
  }, [selectedFiles, validationErrors, onFilesSelected]);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setValidationErrors({});
    onFilesSelected([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFilesSelected]);

  return (
    <div className={`w-full ${className}`}>
      {/* Zona de arrastre */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {/* Icono de subida */}
          {SystemIcons.interface.upload({ size: '2xl', className: 'text-gris-una' })}

          <div>
            <p className="text-lg font-medium text-gris-una">
              {isDragging ? 'Suelte los archivos aquí' : 'Arrastre archivos aquí o haga clic para seleccionar'}
            </p>
            <p className="text-sm text-gris-una mt-1">
              Máximo {maxFiles} archivos - Hasta {formatFileSize(MAX_FILE_SIZE)} por archivo
            </p>
            <p className="text-xs text-gris-una mt-2">
              Formatos: PDF, Word, Excel, PowerPoint, imágenes, videos, archivos comprimidos
            </p>
          </div>
        </div>
      </div>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-negro-una">
              Archivos seleccionados ({selectedFiles.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-xs text-gris-una hover:text-negro-una"
            >
              Limpiar todo
            </button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-blanco-una rounded-md border border-blanco-una"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icono de archivo */}
                  {SystemIcons.modal.document({ size: 'lg', className: 'text-blue-500 flex-shrink-0' })}

                  {/* Info del archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gris-una">
                      {formatFileSize(file.size)}
                    </p>
                    {validationErrors[file.name] && (
                      <p className="text-xs text-rojo-una mt-1">
                        {validationErrors[file.name]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón eliminar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="ml-3 text-rojo-una"
                    >
                      {SystemIcons.actions.cancel({ size: 'md', color: 'currentColor' })}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Eliminar archivo
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
