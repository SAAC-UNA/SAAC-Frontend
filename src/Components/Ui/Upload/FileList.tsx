/**
 * FileList - Componente para mostrar y gestionar archivos subidos
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState } from 'react';
import type { FileModel } from '@/Types/FileTypes';
import { formatFileSize } from '@/Types/FileTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { useToast } from '@/Context/ToastContext';
import { axiosInstance } from '@/Config/axios';
import { FileTypeIcon } from './FileTypeIcon';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';

const MIME_TO_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'PNG', 'image/x-png': 'PNG',
  'image/jpeg': 'JPG', 'image/jpg': 'JPG',
  'image/gif': 'GIF', 'image/webp': 'WEBP', 'image/bmp': 'BMP', 'image/svg+xml': 'SVG',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/zip': 'ZIP', 'application/x-zip-compressed': 'ZIP',
  'application/x-rar-compressed': 'RAR', 'application/vnd.rar': 'RAR',
  'text/csv': 'CSV', 'text/rtf': 'RTF',
  'video/mp4': 'MP4', 'video/avi': 'AVI',
};

/** Convierte el MIME type o la extensión del archivo en una etiqueta legible */
export const getFileTypeLabel = (file: FileModel): string => {
  if (file.tipo === 'enlace') return 'Enlace';
  if (file.tipo_mime && MIME_TO_LABEL[file.tipo_mime]) return MIME_TO_LABEL[file.tipo_mime];
  const ext = file.nombre_original.split('.').pop()?.toUpperCase();
  return ext ?? '—';
};

/** Contenido de una fila de archivo: ícono, nombre, tipo y tamaño */
export const FileRowContent: React.FC<{ file: FileModel }> = ({ file }) => (
  <div className="flex items-center gap-3 flex-1 min-w-0">
    <FileTypeIcon filename={file.nombre_original} isLink={file.tipo === 'enlace'} size="sm" />
    <span className={`font-medium text-negro-una-2 truncate ${TYPOGRAPHY.table.helper}`} title={file.nombre_original}>
      {file.nombre_original}
    </span>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`text-gris-una flex-shrink-0 ml-auto cursor-default ${TYPOGRAPHY.table.helper}`}>{getFileTypeLabel(file)}</span>
      </TooltipTrigger>
      <TooltipContent side="top">Tipo de archivo</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`text-gris-una flex-shrink-0 cursor-default ${TYPOGRAPHY.table.helper}`}>
          {file.tamanio ? formatFileSize(file.tamanio) : '—'}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">Tamaño del archivo</TooltipContent>
    </Tooltip>
  </div>
);

/** Botón de descarga con estado de carga */
export const FileDownloadAction: React.FC<{ file: FileModel }> = ({ file }) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    if (file.tipo === 'enlace') {
      try {
        await navigator.clipboard.writeText(file.url || '');
        showToast({ type: 'success', title: 'URL copiada', message: 'El enlace se copió al portapapeles' });
      } catch {
        showToast({ type: 'error', title: 'Error', message: 'No se pudo copiar el enlace' });
      }
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/archivos/${file.archivo_id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.nombre_original);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast({ type: 'success', title: 'Descarga iniciada', message: `Descargando ${file.nombre_original}` });
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al descargar', message: error.response?.data?.message || 'No se pudo descargar el archivo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableActionButton
      action="custom"
      customIcon={SystemIcons.actions.download({ className: TABLE_ACTION_BUTTON.icon })}
      customVariant="tablePower"
      tooltip={file.tipo === 'archivo' ? 'Descargar' : 'No disponible para enlaces'}
      onClick={handleDownload}
      disabled={loading || file.tipo !== 'archivo'}
    />
  );
};

/** Botón de eliminación con modal de confirmación propio */
export const FileDeleteAction: React.FC<{ file: FileModel; onDelete: (fileId: number) => Promise<void> }> = ({ file, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onDelete(file.archivo_id);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TableActionButton action="delete" tooltip="Eliminar archivo" onClick={() => setShowModal(true)} />
      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        itemName={file.nombre_original}
        isLoading={loading}
      />
    </>
  );
};

interface FileListProps {
  files: FileModel[];
  loading?: boolean;
  onDelete?: (fileId: number) => Promise<void>;
  showActions?: boolean;
  emptyMessage?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  loading = false,
  onDelete,
  showActions = true,
  emptyMessage = 'No hay archivos subidos aún.',
}) => {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleDownload = async (file: FileModel) => {
    if (file.tipo === 'enlace') {
      try {
        await navigator.clipboard.writeText(file.url || '');
        showToast({ type: 'success', title: 'URL copiada', message: 'El enlace se copió al portapapeles' });
      } catch {
        showToast({ type: 'error', title: 'Error', message: 'No se pudo copiar el enlace' });
      }
      return;
    }
    try {
      const response = await axiosInstance.get(`/archivos/${file.archivo_id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.nombre_original);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast({ type: 'success', title: 'Descarga iniciada', message: `Descargando ${file.nombre_original}` });
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al descargar', message: error.response?.data?.message || 'No se pudo descargar el archivo' });
    }
  };

  const handleDeleteClick = (fileId: number) => { setSelectedFileId(fileId); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!selectedFileId || !onDelete) return;
    try {
      setActionLoading(selectedFileId);
      await onDelete(selectedFileId);
      setShowDeleteModal(false);
      setSelectedFileId(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="relative min-h-[60px]"><LoadingSpinner variant="loader" /></div>;
  if (files.length === 0) return <p className={`text-gris-una px-3 py-1.5 ${TYPOGRAPHY.table.helper}`}>{emptyMessage}</p>;

  return (
    <>
      <div className="space-y-1">
        {files.map((file) => (
          <div key={file.archivo_id} className="flex items-center gap-2 px-3 py-1 bg-blanco-una rounded border border-gris-light">
            <FileRowContent file={file} />
            {showActions && (
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <TableActionButton
                  action="custom"
                  customIcon={SystemIcons.actions.download({ className: TABLE_ACTION_BUTTON.icon })}
                  customVariant="tablePower"
                  tooltip={file.tipo === 'archivo' ? 'Descargar' : 'No disponible para enlaces'}
                  onClick={() => handleDownload(file)}
                  disabled={actionLoading === file.archivo_id || file.tipo !== 'archivo'}
                />
                {onDelete && (
                  <TableActionButton
                    action="delete"
                    tooltip="Eliminar archivo"
                    onClick={() => handleDeleteClick(file.archivo_id)}
                    disabled={actionLoading === file.archivo_id}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {showDeleteModal && selectedFileId && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedFileId(null); }}
          onConfirm={handleConfirmDelete}
          itemName={files.find(f => f.archivo_id === selectedFileId)?.nombre_original || 'archivo'}
          isLoading={actionLoading === selectedFileId}
        />
      )}
    </>
  );
};

