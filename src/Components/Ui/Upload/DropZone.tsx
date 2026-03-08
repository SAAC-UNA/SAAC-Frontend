/**
 * DropZone - Área de arrastrar y soltar archivos
 * Sigue el patrón "File upload example" de Untitled UI
 */

import React, { useRef, useState, useCallback } from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { formatFileSize, MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD } from '@/Types/FileTypes';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
  hint?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  disabled = false,
  accept,
  maxFiles = MAX_FILES_PER_UPLOAD,
  hint,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emitFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;
      onFilesSelected(Array.from(files));
    },
    [disabled, onFilesSelected],
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) emitFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emitFiles(e.target.files);
    // Reset para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={[
        'flex items-center gap-4 px-4 py-3',
        'border-2 border-dashed rounded-corner',
        'transition-colors duration-200 select-none',
        isDragging
          ? 'border-azul-una bg-azul-una/5'
          : 'border-gris-una/30 hover:border-azul-una/50 hover:bg-blanco-una',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Ícono + texto */}
      <div className="flex-shrink-0 p-2 rounded-corner border border-gris-una/20 bg-blanco-una shadow-sm">
        {SystemIcons.modal.document({ size: 'md', className: 'text-gris-una' })}
      </div>
      <div>
        <p className="text-sm font-semibold text-negro-una-2">
          Arrastre archivos aquí para subirlos
        </p>
        <p className="text-xs text-gris-una mt-0.5">
          {hint ?? `Hasta ${maxFiles} archivos · máx. ${formatFileSize(MAX_FILE_SIZE)} por archivo`}
        </p>
      </div>
    </div>
  );
};
