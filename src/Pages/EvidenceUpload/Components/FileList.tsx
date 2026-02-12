/**
 * FileList - Componente para mostrar y gestionar archivos subidos
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState } from 'react';
import type { FileModel } from '@/Types/FileTypes';
import { formatFileSize, getFileCategory } from '@/Types/FileTypes';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/TableActionButton';
import { useToast } from '@/Context/ToastContext';
import { axiosInstance } from '@/Config/axios';

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

  const getFileIcon = (filename: string) => {
    const category = getFileCategory(filename);
    
    const icons = {
      document: (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      spreadsheet: (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v4H6V4zm0 6h3v6H6v-6zm5 0h3v6h-3v-6z" clipRule="evenodd" />
        </svg>
      ),
      presentation: (
        <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      ),
      image: (
        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      video: (
        <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
      archive: (
        <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      other: (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      ),
      link: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    };

    return icons[category] || icons.other;
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
                {getFileIcon(file.nombre_original)}
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
