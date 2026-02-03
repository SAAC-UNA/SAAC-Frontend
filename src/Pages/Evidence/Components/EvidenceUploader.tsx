/**
 * EvidenceUploader - Componente completo para subir evidencias
 * Soporta archivos físicos y enlaces/URLs
 */

import React, { useState, useCallback } from 'react';
import { fileService } from '@/Services/FileService';
import LinkInput from '@/Components/Ui/LinkInput';
import type { FileModel } from '@/Types/FileTypes';
import { MAX_FILES_PER_UPLOAD, MAX_LINKS_PER_UPLOAD } from '@/Types/FileTypes';

interface EvidenceUploaderProps {
  evidenciaId: number;
  procesoId: number;
  onUploadSuccess?: (files: FileModel[]) => void;
  onUploadError?: (error: string) => void;
}

type UploadMode = 'files' | 'links' | 'both';

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidenciaId,
  procesoId,
  onUploadSuccess,
  onUploadError
}) => {
  const [mode, setMode] = useState<UploadMode>('files');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Manejo de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const remainingSlots = MAX_FILES_PER_UPLOAD - selectedFiles.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      setSelectedFiles([...selectedFiles, ...filesToAdd]);
    }
    
    if (newFiles.length > remainingSlots) {
      alert(`Solo se agregaron ${filesToAdd.length} archivos. Límite: ${MAX_FILES_PER_UPLOAD}`);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Manejo de drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [selectedFiles]);

  // Subida de evidencias
  const handleUpload = async () => {
    // Validaciones
    if (mode === 'files' && selectedFiles.length === 0) {
      onUploadError?.('Debe seleccionar al menos un archivo');
      return;
    }
    
    if (mode === 'links' && selectedLinks.length === 0) {
      onUploadError?.('Debe agregar al menos un enlace');
      return;
    }
    
    if (mode === 'both' && selectedFiles.length === 0 && selectedLinks.length === 0) {
      onUploadError?.('Debe seleccionar archivos o agregar enlaces');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let result;

      if (mode === 'files') {
        // Solo archivos
        result = await fileService.uploadMultipleFiles(
          selectedFiles,
          evidenciaId,
          procesoId,
          (progress) => setUploadProgress(progress)
        );
      } else if (mode === 'links') {
        // Solo enlaces
        result = await fileService.uploadMultipleLinks(
          selectedLinks,
          evidenciaId,
          procesoId
        );
      } else {
        // Ambos
        result = await fileService.uploadFilesAndLinks(
          selectedFiles,
          selectedLinks,
          evidenciaId,
          procesoId,
          (progress) => setUploadProgress(progress)
        );
      }

      // Manejar resultado
      if (result.successful.length > 0) {
        onUploadSuccess?.(result.successful);
        
        // Limpiar formulario
        setSelectedFiles([]);
        setSelectedLinks([]);
        setUploadProgress(0);
      }

      // Mostrar errores si los hay
      if (result.failed.length > 0) {
        const errorMessages = result.failed.map(f => {
          if ('file' in f) {
            return `${f.file.name}: ${f.error}`;
          } else if ('url' in f) {
            return `${f.url}: ${f.error}`;
          } else {
            return `${f.item}: ${f.error}`;
          }
        }).join('\n');
        
        onUploadError?.(
          `${result.successful.length} evidencias subidas correctamente.\n\nErrores:\n${errorMessages}`
        );
      }

    } catch (error: any) {
      onUploadError?.(error.message || 'Error al subir evidencias');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      {/* Selector de modo */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setMode('files')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === 'files'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Archivos
        </button>
        <button
          type="button"
          onClick={() => setMode('links')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === 'links'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enlaces
        </button>
        <button
          type="button"
          onClick={() => setMode('both')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === 'both'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ambos
        </button>
      </div>

      {/* Área de subida de archivos */}
      {(mode === 'files' || mode === 'both') && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Subir Archivos</h3>
          
          {/* Zona de drag & drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Seleccionar archivos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFileSelect}
                    disabled={isUploading || selectedFiles.length >= MAX_FILES_PER_UPLOAD}
                  />
                </label>
                <span> o arrastrar aquí</span>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, XLS, PPT, imágenes, videos (máx. 50MB por archivo)
              </p>
            </div>
          </div>

          {/* Lista de archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Archivos seleccionados ({selectedFiles.length}/{MAX_FILES_PER_UPLOAD})
              </h4>
              <ul className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Área de enlaces */}
      {(mode === 'links' || mode === 'both') && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Agregar Enlaces</h3>
          <LinkInput
            onLinksChange={setSelectedLinks}
            maxLinks={MAX_LINKS_PER_UPLOAD}
            disabled={isUploading}
          />
        </div>
      )}

      {/* Barra de progreso */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Subiendo... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Botón de subida */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={
          isUploading ||
          (mode === 'files' && selectedFiles.length === 0) ||
          (mode === 'links' && selectedLinks.length === 0) ||
          (mode === 'both' && selectedFiles.length === 0 && selectedLinks.length === 0)
        }
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isUploading ? 'Subiendo...' : 'Subir Evidencias'}
      </button>
    </div>
  );
};

export default EvidenceUploader;
