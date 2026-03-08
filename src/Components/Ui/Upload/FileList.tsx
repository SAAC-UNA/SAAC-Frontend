/**
 * FileList - Componente para mostrar y gestionar archivos subidos
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState } from 'react';
import type { FileModel } from '@/Types/FileTypes';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { useToast } from '@/Context/ToastContext';
import { axiosInstance } from '@/Config/axios';
import { FileTypeIcon } from './FileTypeIcon';

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
  emptyMessage = 'No hay archivos subidos aún.'
}) => {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleFileClick = async (file: FileModel) => {
    if (file.tipo === 'enlace') {
      // Copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(file.url || '');
        showToast({
          type: 'success',
          title: 'URL copiada',
          message: 'El enlace se copió al portapapeles',
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo copiar el enlace',
        });
      }
    } else {
      // Descargar archivo
      try {
        const response = await axiosInstance.get(`/archivos/${file.archivo_id}/download`, {
          responseType: 'blob',
        });
        
        // Crear URL temporal del blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.nombre_original);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showToast({
          type: 'success',
          title: 'Descarga iniciada',
          message: `Descargando ${file.nombre_original}`,
        });
      } catch (error: any) {
        showToast({
          type: 'error',
          title: 'Error al descargar',
          message: error.response?.data?.message || 'No se pudo descargar el archivo',
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    // Asegurar que la fecha se parsee correctamente desde el backend
    // El backend envía fechas en zona horaria de Costa Rica
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Costa_Rica'
    }).format(date);
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



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-blanco-una-2 rounded-corner border-2 border-dashed border-gray-300">
        <div className="mx-auto flex justify-center text-gris-una">
          {SystemIcons.modal.document({ size: '2xl' })}
        </div>
        <p className="mt-4 text-sm text-gris-una">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.archivo_id}
            className="bg-blanco-una-2 border border-gray-200 rounded-corner p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Icono del archivo */}
              <div className="flex-shrink-0">
                <FileTypeIcon
                  filename={file.nombre_original}
                  isLink={file.tipo === 'enlace'}
                />
              </div>

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate cursor-pointer"
                      onClick={() => handleFileClick(file)}
                      title={file.tipo === 'enlace' ? 'Clic para copiar URL' : 'Clic para descargar'}
                    >
                      {file.nombre_original}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>{formatDate(file.fecha_subida)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {showActions && (
                    <div className="flex items-center gap-1">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
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
