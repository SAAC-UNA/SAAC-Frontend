/**
 * FileUploadProgress - Componente para mostrar progreso de subida de archivos
 * HU008 - Subida de Evidencias al Sistema
 */

import React from 'react';
import { formatFileSize } from '@/Types/FileTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';

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

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  files,
  onCancel,
  onRetry
}) => {
  if (files.length === 0) return null;

  const getStatusIcon = (status: FileUploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return (
          <SystemIcons.interface.clock 
            size="md" 
            className="text-gray-400" 
          />
        );
      case 'uploading':
        return (
          <LoadingSpinner 
            size="md" 
            variant="uploading" 
            color="primary" 
            className="text-blue-500"
          />
        );
      case 'success':
        return (
          <SystemIcons.interface.checkCircle 
            size="md" 
            className="text-green-500" 
          />
        );
      case 'error':
        return (
          <SystemIcons.interface.closeCircle 
            size="md" 
            className="text-red-500" 
          />
        );
    }
  };

  const getStatusText = (item: FileUploadProgressItem) => {
    switch (item.status) {
      case 'pending':
        return 'Esperando...';
      case 'uploading':
        return `Subiendo... ${item.progress}%`;
      case 'success':
        return 'Subido exitosamente';
      case 'error':
        return item.error || 'Error al subir';
    }
  };

  const getStatusColor = (status: FileUploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100';
      case 'uploading':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'success').length;
  const failedFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className="w-full">
      {/* Resumen general */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-corner">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Progreso de subida
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              {completedFiles} de {totalFiles} archivos completados
              {failedFiles > 0 && ` • ${failedFiles} fallidos`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
              {Math.round((completedFiles / totalFiles) * 100)}%
            </span>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de archivos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {files.map((item, index) => (
          <div
            key={`${item.file.name}-${index}`}
            className={`
              p-3 rounded-corner border transition-all
              ${getStatusColor(item.status)}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icono de estado */}
              <div className="mt-0.5">
                {getStatusIcon(item.status)}
              </div>

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.uploadedFileName || item.file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    {item.status === 'error' && onRetry && (
                      <button
                        onClick={() => onRetry(index)}
                        className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-100 rounded"
                        title="Reintentar"
                      >
                        Reintentar
                      </button>
                    )}
                    {(item.status === 'pending' || item.status === 'uploading') && onCancel && (
                      <button
                        onClick={() => onCancel(index)}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-100 rounded"
                        title="Cancelar"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <p className={`
                  text-xs mt-1
                  ${item.status === 'success' ? 'text-green-600' : ''}
                  ${item.status === 'error' ? 'text-red-600' : ''}
                  ${item.status === 'uploading' ? 'text-blue-600' : ''}
                  ${item.status === 'pending' ? 'text-gray-500' : ''}
                `}>
                  {getStatusText(item)}
                </p>

                {/* Barra de progreso individual */}
                {item.status === 'uploading' && (
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
