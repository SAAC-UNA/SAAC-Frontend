/**
 * FileList - Componente para mostrar y gestionar archivos subidos
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState } from 'react';
import type { FileModel } from '@/Types/FileTypes';
import { formatFileSize } from '@/Types/FileTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { truncateText } from '@/Utils';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { useToast } from '@/Context/ToastContext';
import { axiosInstance } from '@/Config/axios';
import { FileTypeIcon } from './FileTypeIcon';

type FileRow = FileModel & Record<string, unknown>;

/** Convierte el MIME type o la extensión del archivo en una etiqueta legible */
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

const getFileTypeLabel = (file: FileModel): string => {
  if (file.tipo === 'enlace') return 'Enlace';
  if (file.tipo_mime && MIME_TO_LABEL[file.tipo_mime]) return MIME_TO_LABEL[file.tipo_mime];
  const ext = file.nombre_original.split('.').pop()?.toUpperCase();
  return ext ?? '—';
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
  const firstColumn = useFirstColumnConfig();

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
      const response = await axiosInstance.get(`/archivos/${file.archivo_id}/download`, {
        responseType: 'blob',
      });
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
      showToast({
        type: 'error',
        title: 'Error al descargar',
        message: error.response?.data?.message || 'No se pudo descargar el archivo',
      });
    }
  };

  const handleDeleteClick = (fileId: number) => {
    setSelectedFileId(fileId);
    setShowDeleteModal(true);
  };

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

  const columns: DataTableColumn<FileRow>[] = [
    {
      key: 'nombre_original',
      header: 'Nombre',
      width: firstColumn.width,
      render: (_, item) => {
        const file = item as unknown as FileModel;
        return (
          <div className="flex items-center gap-2">
            <FileTypeIcon filename={file.nombre_original} isLink={file.tipo === 'enlace'} size="sm" />
            <span className={`font-medium text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={file.nombre_original}>
              {truncateText(file.nombre_original, firstColumn.maxLength)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'tipo_mime',
      header: 'Tipo',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una ${TYPOGRAPHY.table.cell}`}>{getFileTypeLabel(item as unknown as FileModel)}</span>
      ),
    },
    {
      key: 'tamanio',
      header: 'Tamaño',
      align: 'center',
      render: (_, item) => {
        const file = item as unknown as FileModel;
        return <span className={`text-gris-una ${TYPOGRAPHY.table.cell}`}>{file.tamanio ? formatFileSize(file.tamanio) : '—'}</span>;
      },
    },
    ...(showActions ? [{
      key: 'acciones',
      header: 'Acciones',
      align: 'center' as const,
      render: (_: unknown, item: FileRow) => {
        const file = item as unknown as FileModel;
        return (
          <div className="flex items-center justify-center gap-1">
            {file.tipo === 'archivo' && (
              <TableActionButton
                action="custom"
                customIcon={SystemIcons.actions.download({ className: TABLE_ACTION_BUTTON.icon })}
                customVariant="tablePower"
                tooltip="Descargar"
                onClick={() => handleDownload(file)}
                disabled={actionLoading === file.archivo_id}
              />
            )}
            {onDelete && (
              <TableActionButton
                action="delete"
                tooltip="Eliminar archivo"
                onClick={() => handleDeleteClick(file.archivo_id)}
                disabled={actionLoading === file.archivo_id}
              />
            )}
          </div>
        );
      },
    }] : []),
  ];

  return (
    <>
      <DataTable<FileRow>
        data={files as FileRow[]}
        columns={columns as any}
        title=""
        searchable={false}
        loading={loading}
        emptyMessage={emptyMessage}
      />
      {showDeleteModal && selectedFileId && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedFileId(null);
          }}
          onConfirm={handleConfirmDelete}
          itemName={files.find(f => f.archivo_id === selectedFileId)?.nombre_original || 'archivo'}
          isLoading={actionLoading === selectedFileId}
        />
      )}
    </>
  );
};

