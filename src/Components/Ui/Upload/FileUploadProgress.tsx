/**
 * FileUploadProgress - Lista de archivos con indicador de progreso
 * Sigue el patrón "Progress fill" de Untitled UI:
 * cada ítem muestra nombre/tamaño + porcentaje y una barra de relleno al pie de la tarjeta.
 * HU008 - Subida de Evidencias al Sistema
 */

import React from 'react';
import { formatFileSize } from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { Button } from '@/Components/Ui/Buttons/Button';
import { FileTypeIcon } from './FileTypeIcon';
import { TYPOGRAPHY } from '@/constants/Typography';

export interface FileUploadProgressItem {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedFileName?: string;
}

interface FileUploadProgressProps {
  files: FileUploadProgressItem[];
  onCancel?: (index: number) => void;
  onRetry?: (index: number) => void;
}

// ── helpers ─────────────────────────────────────────────────────────────────

function getBarColor(status: FileUploadProgressItem['status']): string {
  switch (status) {
    case 'uploading': return 'bg-azul-una';
    case 'success':   return 'bg-green-500';
    case 'error':     return 'bg-red-500';
    default:          return 'bg-gris-una/30';
  }
}

function getBarWidth(item: FileUploadProgressItem): number {
  switch (item.status) {
    case 'success': return 100;
    case 'error':   return 100;
    case 'pending': return 0;
    default:        return item.progress;
  }
}

// ── sub-componente ───────────────────────────────────────────────────────────

interface FileProgressItemProps {
  item: FileUploadProgressItem;
  index: number;
  onCancel?: (index: number) => void;
  onRetry?: (index: number) => void;
}

const FileProgressItem: React.FC<FileProgressItemProps> = ({ item, index, onCancel, onRetry }) => {
  const barColor = getBarColor(item.status);
  const barWidth = getBarWidth(item);
  const displayName = item.uploadedFileName ?? item.file.name;

  return (
    <div className="rounded-corner border border-gris-una/20 bg-blanco-una overflow-hidden">
      {/* Contenido principal */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Ícono de tipo de archivo */}
        <div className="flex-shrink-0">
          <FileTypeIcon filename={displayName} />
        </div>

        {/* Nombre y tamaño */}
        <div className="flex-1 min-w-0">
          <p className={`${TYPOGRAPHY.body} font-medium text-negro-una-2 truncate`}>
            {displayName}
          </p>
          <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
            {formatFileSize(item.file.size)}
            {item.status === 'error' && item.error && (
              <span className="text-red-500 ml-2">· {item.error}</span>
            )}
          </p>
        </div>

        {/* Estado / porcentaje / acciones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.status === 'uploading' && (
            <>
              <span className={`${TYPOGRAPHY.form.helper} font-medium text-azul-una tabular-nums`}>
                {item.progress}%
              </span>
              <LoadingSpinner size="sm" variant="uploading" color="primary" />
            </>
          )}

          {item.status === 'pending' && (
            <SystemIcons.interface.clock size="md" className="text-gris-una" />
          )}

          {item.status === 'success' && (
            <SystemIcons.interface.checkCircle size="md" className="text-green-500" />
          )}

          {item.status === 'error' && (
            <SystemIcons.interface.closeCircle size="md" className="text-red-500" />
          )}

          {/* Cancelar (en curso o pendiente) */}
          {(item.status === 'pending' || item.status === 'uploading') && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCancel(index)}
              title="Cancelar"
            >
              {SystemIcons.actions.cancel({ size: 'sm', className: 'text-gris-una' })}
            </Button>
          )}

          {/* Reintentar (error) */}
          {item.status === 'error' && onRetry && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRetry(index)}
              title="Reintentar"
            >
              {SystemIcons.interface.refresh({ size: 'sm', className: 'text-azul-una' })}
            </Button>
          )}
        </div>
      </div>

      {/* Barra de relleno al pie — "Progress fill" */}
      <div className="h-1.5 w-full bg-gris-una/10">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

// ── componente principal ─────────────────────────────────────────────────────

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  files,
  onCancel,
  onRetry,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      {files.map((item, index) => (
        <FileProgressItem
          key={`${item.file.name}-${index}`}
          item={item}
          index={index}
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
};
