/**
 * FileUploader - Zona de selección + lista de archivos pre-subida
 * Orquestra DropZone (UI) + validación + lista editable de archivos seleccionados.
 */

import React from 'react';
import {
  formatFileSize,
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILES_PER_UPLOAD,
} from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Button } from '@/Components/Ui/Buttons/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Feedback/Tooltip';
import { TYPOGRAPHY } from '@/constants/Typography';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { DropZone } from './DropZone';
import { FileTypeIcon } from './FileTypeIcon';
import { useFileUpload } from '../../../Hooks/useFileUpload';

type SelectedRow = Record<string, unknown> & { _file: File; _index: number };

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
  const { files: selectedFiles, errors: validationErrors, addFiles, removeFile, clearAll } = useFileUpload(onFilesSelected, maxFiles);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Zona de arrastre y diseño Untitled UI */}
      <DropZone
        onFilesSelected={addFiles}
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

          {(() => {
            const fileRows: SelectedRow[] = selectedFiles.map((file, index) => ({
              _file: file,
              _index: index,
              name: file.name,
              size: file.size,
            }));

            const columns: DataTableColumn<SelectedRow>[] = [
              {
                key: 'name',
                header: 'Nombre',
                render: (_, item) => {
                  const { _file: file } = item;
                  return (
                    <div className="flex items-center gap-2 min-w-0">
                      <FileTypeIcon filename={file.name} />
                      <div className="min-w-0">
                        <p className={`${TYPOGRAPHY.body} font-medium text-negro-una-2 truncate`}>
                          {file.name}
                        </p>
                        {validationErrors[file.name] && (
                          <p className={`${TYPOGRAPHY.form.helper} text-rojo-una`}>
                            {validationErrors[file.name]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'size',
                header: 'Tamaño',
                align: 'center',
                render: (_, item) => (
                  <span className="text-gris-una">{formatFileSize(item._file.size)}</span>
                ),
              },
              {
                key: 'remove',
                header: '',
                align: 'right',
                render: (_, item) => (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); removeFile(item._index); }}
                      >
                        {SystemIcons.actions.cancel({ size: 'md', className: 'text-rojo-una' })}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Eliminar archivo</TooltipContent>
                  </Tooltip>
                ),
              },
            ];

            return (
              <DataTable<SelectedRow>
                data={fileRows}
                columns={columns as any}
                title=""
                searchable={false}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
};