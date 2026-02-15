/**
 * EvidenceUploadPage - Página principal para subida de evidencias
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { Button } from '@/Components/Ui/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Tooltip';
import { FileUploader } from './Components/FileUploader';
import { FileUploadProgress, type FileUploadProgressItem } from './Components/FileUploadProgress';
import { FileList } from './Components/FileList';
import LinkInput from '@/Components/Ui/LinkInput';
import { fileService } from '@/Services/FileService';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import type { FileModel } from '@/Types/FileTypes';

interface EvidenceUploadPageProps {
  evidenciaId?: number;
  procesoId?: number;
  evidenciaNombre?: string;
}

export const EvidenceUploadPage: React.FC<EvidenceUploadPageProps> = ({
  evidenciaId: propEvidenciaId,
  procesoId: propProcesoId,
  evidenciaNombre: propEvidenciaNombre
}) => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obtener IDs desde props o desde URL query params
  const evidenciaId = propEvidenciaId ?? (Number(searchParams.get('evidenciaId')) || undefined);
  const procesoId = propProcesoId ?? (Number(searchParams.get('procesoId')) || undefined);
  const evidenciaNombre = propEvidenciaNombre ?? searchParams.get('nombre') ?? 'Evidencia';
  
  // Estados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgressItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0); // Key para forzar re-render de componentes

  // Cargar archivos existentes al montar el componente
  useEffect(() => {
    if (evidenciaId) {
      loadFiles();
    }
  }, [evidenciaId]);

  const loadFiles = async () => {
    if (!evidenciaId) return;
    
    try {
      setLoadingFiles(true);
      const files = await fileService.listFiles({ evidencia_id: evidenciaId });
      setUploadedFiles(files);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al cargar archivos',
        message: error.message || 'No se pudieron cargar los archivos existentes'
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleStartUpload = async () => {
    if (!evidenciaId || !procesoId) {
      showToast({
        type: 'error',
        title: 'Información incompleta',
        message: 'Se requiere el ID de evidencia y proceso para subir archivos'
      });
      return;
    }

    if (selectedFiles.length === 0 && selectedLinks.length === 0) {
      showToast({
        type: 'warning',
        title: 'No hay evidencias seleccionadas',
        message: 'Por favor, seleccione archivos o agregue enlaces para subir'
      });
      return;
    }

    setIsUploading(true);

    // Inicializar el progreso con todos los archivos en "pending"
    const initialProgress: FileUploadProgressItem[] = selectedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));
    setUploadProgress(initialProgress);

    try {
      let result;
      
      // Decidir qué método usar según lo que hay seleccionado
      if (selectedFiles.length > 0 && selectedLinks.length > 0) {
        // Ambos: archivos y enlaces
        result = await fileService.uploadFilesAndLinks(
          selectedFiles,
          selectedLinks,
          evidenciaId,
          procesoId,
          (progress) => {
            setUploadProgress(prev => 
              prev.map(item => ({
                ...item,
                status: item.status === 'pending' ? 'uploading' : item.status,
                progress: item.status === 'success' || item.status === 'error' ? item.progress : progress
              }))
            );
          }
        );
      } else if (selectedFiles.length > 0) {
        // Solo archivos
        result = await fileService.uploadMultipleFiles(
          selectedFiles,
          evidenciaId,
          procesoId,
          (progress) => {
            setUploadProgress(prev => 
              prev.map(item => ({
                ...item,
                status: item.status === 'pending' ? 'uploading' : item.status,
                progress: item.status === 'success' || item.status === 'error' ? item.progress : progress
              }))
            );
          }
        );
      } else {
        // Solo enlaces
        result = await fileService.uploadMultipleLinks(
          selectedLinks,
          evidenciaId,
          procesoId
        );
      }

      // Actualizar estado de cada archivo según el resultado
      setUploadProgress(prev =>
        prev.map((item, index) => {
          // Buscar si este archivo está en successful o failed
          const successFile = result.successful.find(
            (_, i) => i === index && index < result.successful.length
          );
          
          // Para resultado mixto (archivos y enlaces)
          let failedFile;
          if (result.failed.length > 0) {
            const firstFailed = result.failed[0];
            if ('type' in firstFailed) {
              // Resultado mixto con tipo
              failedFile = result.failed.find(f => 'type' in f && 'item' in f && f.item === item.file);
            } else if ('file' in firstFailed) {
              // Resultado solo archivos
              failedFile = result.failed.find(f => 'file' in f && f.file === item.file);
            }
          }

          if (successFile) {
            return {
              ...item,
              status: 'success',
              progress: 100,
              uploadedFileName: successFile.nombre_original
            };
          } else if (failedFile) {
            return {
              ...item,
              status: 'error',
              progress: 0,
              error: failedFile.error
            };
          }
          return item;
        })
      );

      // Mostrar resumen de la subida
      const successCount = result.successful.length;
      const failedCount = result.failed.length;

      if (successCount > 0 && failedCount === 0) {
        // Todos exitosos
        showToast({
          type: 'success',
          title: 'Subida completada',
          message: `${successCount} evidencia(s) subida(s) exitosamente`
        });
      } else if (successCount > 0 && failedCount > 0) {
        // Algunos exitosos, algunos fallidos
        showToast({
          type: 'warning',
          title: 'Subida parcial',
          message: `${successCount} exitosas, ${failedCount} fallidas`
        });
      } else if (failedCount > 0) {
        // Todos fallidos
        const firstError = result.failed[0]?.error || 'Error desconocido';
        showToast({
          type: 'error',
          title: 'Subida fallida',
          message: failedCount === 1 ? firstError : `${failedCount} evidencias fallaron`
        });
      }

      // Recargar lista de archivos si hubo éxitos
      if (successCount > 0) {
        await loadFiles();
      }

      // Limpiar selección si todos fueron exitosos
      if (failedCount === 0) {
        setSelectedFiles([]);
        setSelectedLinks([]);
        setUploaderKey(prev => prev + 1); // Cambiar key para forzar re-render
        setTimeout(() => {
          setUploadProgress([]);
        }, 3000); // Mantener el progreso visible por 3 segundos
      }
    } catch (error: any) {
      // Error crítico (autenticación, permisos, etc)
      showToast({
        type: 'error',
        title: 'Error al subir archivos',
        message: error.message || 'Ocurrió un error durante la subida'
      });
      
      // Marcar todos como error
      setUploadProgress(prev =>
        prev.map(item => ({
          ...item,
          status: 'error',
          error: error.message || 'Error desconocido'
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
    setSelectedLinks([]);
    setUploadProgress([]);
    setUploaderKey(prev => prev + 1); // Cambiar key para forzar re-render
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await fileService.deleteFile(fileId);
      showToast({
        type: 'success',
        title: 'Archivo eliminado',
        message: 'El archivo se eliminó correctamente'
      });
      await loadFiles();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al eliminar',
        message: error.message || 'No se pudo eliminar el archivo'
      });
    }
  };

  const moduleInfo = getModuleInfo('evidence_upload');

  const handleGoBack = () => {
    navigate('/mis-evidencias-asignadas');
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={`${moduleInfo.description}\nEvidencia: ${evidenciaNombre}`}
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sección de subida */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-negro-una mb-4">
              Seleccione archivos
            </h2>
            
            <FileUploader
              key={`file-uploader-${uploaderKey}`}
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />
          </div>

          {/* Sección de enlaces */}
          <div>
            <h2 className="text-lg font-semibold text-negro-una mb-4">
              Enlaces externos
            </h2>
            
            <LinkInput
              key={`link-input-${uploaderKey}`}
              onLinksChange={setSelectedLinks}
              disabled={isUploading}
              className="w-full"
            />
          </div>

          {/* Botones de acción */}
          {(selectedFiles.length > 0 || selectedLinks.length > 0) && !isUploading && (
            <div className="mt-4 flex gap-3 justify-end">
              <Button
                type="button"
                onClick={handleCancelUpload}
                variant="secondary"
                standardWidth={true}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleStartUpload}
                variant="primary"
                standardWidth={true}
                size="sm"
              >
                Subir
              </Button>
            </div>
          )}
        </div>

        {/* Progreso de subida */}
        {uploadProgress.length > 0 && (
          <div>
            <FileUploadProgress files={uploadProgress} />
          </div>
        )}

        {/* Lista de archivos subidos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-negro-una">
              Archivos subidos
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={loadFiles}
                  disabled={loadingFiles}
                  variant="transparent"
                  size="sm"
                >
                  {SystemIcons.interface.refresh({ 
                    size: 'sm', 
                    className: loadingFiles ? 'animate-spin' : '' 
                  })}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Actualizar lista de archivos
              </TooltipContent>
            </Tooltip>
          </div>

          <FileList
            files={uploadedFiles}
            loading={loadingFiles}
            onDelete={handleDeleteFile}
          />
        </div>

        {/* Botón para volver a Mis Evidencias */}
        <div className="mt-6 flex justify-center">
          <Button
                type="button"
                onClick={handleGoBack}
                variant="secondary"
                standardWidth={true}
                size="sm"
              >
                Regresar
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
