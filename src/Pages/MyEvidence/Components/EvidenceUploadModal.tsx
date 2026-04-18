/**
 * EvidenceUploadModal - Modal de subida de evidencias (modelo tradicional)
 * HU008 - Subida de Evidencias al Sistema
 */

import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { Button } from "@/Components/Ui/Buttons/Button";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/Components/Ui/Feedback/Tooltip";
import {
  FileUploader,
  FileUploadProgress,
  FileList,
} from "@/Components/Ui/Upload";
import type { FileUploadProgressItem } from "@/Components/Ui/Upload";
import { LinkInput } from "@/Components/Ui/Forms/LinkInput";
import { LoadingSpinner } from "@/Components/Ui/Index";
import { fileService } from "@/Services/FileService";
import { useToast } from "@/Context/ToastContext";
import type { FileModel } from "@/Types/FileTypes";
import { TYPOGRAPHY } from "@/Constants/Typography";

interface EvidenceUploadPageProps {
  isOpen: boolean;
  onClose: () => void;
  evidenciaId: number;
  procesoId: number;
  nombre: string;
  onSuccess?: () => void;
}

export const EvidenceUploadPage: React.FC<EvidenceUploadPageProps> = ({
  isOpen,
  onClose,
  evidenciaId,
  procesoId,
  nombre,
  onSuccess,
}) => {
  const { showToast } = useToast();

  // Estados
  const [uploadState, setUploadState] = useState<{
    selectedFiles: File[];
    selectedLinks: string[];
    uploadProgress: FileUploadProgressItem[];
    isUploading: boolean;
    uploaderKey: number;
  }>({
    selectedFiles: [],
    selectedLinks: [],
    uploadProgress: [],
    isUploading: false,
    uploaderKey: 0,
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Cargar archivos existentes al abrir el modal
  useEffect(() => {
    if (isOpen) loadFiles();
  }, [isOpen, evidenciaId]);

  const loadFiles = async () => {
    if (!evidenciaId) return;

    try {
      setLoadingFiles(true);
      const files = await fileService.listFiles({
        evidencia_id: evidenciaId,
        ...(procesoId ? { proceso_id: procesoId } : {}),
      });
      setUploadedFiles(files);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al cargar archivos",
        message:
          error.message || "No se pudieron cargar los archivos existentes",
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadState((prev) => ({ ...prev, selectedFiles: files }));
  };

  const handleStartUpload = async () => {
    if (!evidenciaId || !procesoId) {
      showToast({
        type: "error",
        title: "Información incompleta",
        message: "Se requiere el ID de evidencia y proceso para subir archivos",
      });
      return;
    }

    if (selectedFiles.length === 0 && selectedLinks.length === 0) {
      showToast({
        type: "warning",
        title: "No hay evidencias seleccionadas",
        message: "Por favor, seleccione archivos o agregue enlaces para subir",
      });
      return;
    }

    setUploadState((prev) => ({ ...prev, isUploading: true }));

    // Inicializar el progreso con todos los archivos en "pending"
    const initialProgress: FileUploadProgressItem[] = selectedFiles.map(
      (file) => ({
        file,
        status: "pending",
        progress: 0,
      }),
    );
    setUploadState((prev) => ({ ...prev, uploadProgress: initialProgress }));

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
            setUploadState((prev) => ({
              ...prev,
              uploadProgress: prev.uploadProgress.map((item) => ({
                ...item,
                status: item.status === "pending" ? "uploading" : item.status,
                progress:
                  item.status === "success" || item.status === "error"
                    ? item.progress
                    : progress,
              })),
            }));
          },
        );
      } else if (selectedFiles.length > 0) {
        // Solo archivos
        result = await fileService.uploadMultipleFiles(
          selectedFiles,
          evidenciaId,
          procesoId,
          (progress) => {
            setUploadState((prev) => ({
              ...prev,
              uploadProgress: prev.uploadProgress.map((item) => ({
                ...item,
                status: item.status === "pending" ? "uploading" : item.status,
                progress:
                  item.status === "success" || item.status === "error"
                    ? item.progress
                    : progress,
              })),
            }));
          },
        );
      } else {
        // Solo enlaces
        result = await fileService.uploadMultipleLinks(
          selectedLinks,
          evidenciaId,
          procesoId,
        );
      }

      // Actualizar estado de cada archivo según el resultado
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item, index) => {
          // Buscar si este archivo está en successful o failed
          const successFile = result.successful.find(
            (_, i) => i === index && index < result.successful.length,
          );

          // Para resultado mixto (archivos y enlaces)
          let failedFile;
          if (result.failed.length > 0) {
            const firstFailed = result.failed[0];
            if ("type" in firstFailed) {
              // Resultado mixto con tipo
              failedFile = result.failed.find(
                (f) => "type" in f && "item" in f && f.item === item.file,
              );
            } else if ("file" in firstFailed) {
              // Resultado solo archivos
              failedFile = result.failed.find(
                (f) => "file" in f && f.file === item.file,
              );
            }
          }

          if (successFile) {
            return {
              ...item,
              status: "success",
              progress: 100,
              uploadedFileName: successFile.nombre_original,
            };
          } else if (failedFile) {
            return {
              ...item,
              status: "error",
              progress: 0,
              error: failedFile.error,
            };
          }
          return item;
        }),
      }));

      // Mostrar resumen de la subida
      const successCount = result.successful.length;
      const failedCount = result.failed.length;

      if (successCount > 0 && failedCount === 0) {
        // Todos exitosos
        showToast({
          type: "success",
          title: "Subida completada",
          message: `${successCount} evidencia(s) subida(s) exitosamente`,
        });
      } else if (successCount > 0 && failedCount > 0) {
        // Algunos exitosos, algunos fallidos
        showToast({
          type: "warning",
          title: "Subida parcial",
          message: `${successCount} exitosas, ${failedCount} fallidas`,
        });
      } else if (failedCount > 0) {
        // Todos fallidos
        const firstError = result.failed[0]?.error || "Error desconocido";
        showToast({
          type: "error",
          title: "Subida fallida",
          message:
            failedCount === 1
              ? firstError
              : `${failedCount} evidencias fallaron`,
        });
      }

      if (successCount > 0) {
        await loadFiles();
        onSuccess?.();
      }

      // Limpiar selección si todos fueron exitosos
      if (failedCount === 0) {
        setUploadState((prev) => ({
          ...prev,
          selectedFiles: [],
          selectedLinks: [],
          uploaderKey: prev.uploaderKey + 1,
        }));
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, uploadProgress: [] }));
        }, 3000); // Mantener el progreso visible por 3 segundos
      }
    } catch (error: any) {
      // Error crítico (autenticación, permisos, etc)
      showToast({
        type: "error",
        title: "Error al subir archivos",
        message: error.message || "Ocurrió un error durante la subida",
      });

      // Marcar todos como error
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map((item) => ({
          ...item,
          status: "error",
          error: error.message || "Error desconocido",
        })),
      }));
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const { selectedFiles, selectedLinks, uploadProgress, isUploading, uploaderKey } = uploadState;

  const handleClose = () => {
    if (!isUploading) onClose();
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await fileService.deleteFile(fileId);
      showToast({
        type: "success",
        title: "Archivo eliminado",
        message: "El archivo se eliminó correctamente",
      });
      await loadFiles();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al eliminar",
        message: error.message || "No se pudo eliminar el archivo",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Subir recursos: ${nombre}`}
      variant="warning"
      size="xl"
      maxHeight="xl"
      footerButtons={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isUploading} standardWidth>
            Cerrar
          </Button>
          {(selectedFiles.length > 0 || selectedLinks.length > 0) && !isUploading && (
            <>
              <Button variant="secondary" onClick={handleStartUpload} standardWidth>
                Subir
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Archivos */}
        <div>
          <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-2`}>
            Seleccione archivos
          </h2>
          <FileUploader
            key={`file-uploader-${uploaderKey}`}
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
          />
        </div>

        {/* Enlaces */}
        <div>
          <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-2`}>
            Enlaces externos
          </h2>
          <LinkInput
            key={`link-input-${uploaderKey}`}
            onLinksChange={(links) =>
              setUploadState((prev) => ({ ...prev, selectedLinks: links }))
            }
            disabled={isUploading}
            className="w-full"
          />
        </div>

        {/* Progreso */}
        {uploadProgress.length > 0 && (
          <FileUploadProgress files={uploadProgress} />
        )}

        {/* Archivos subidos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2`}>
              Archivos subidos
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loadingFiles}>
                  {SystemIcons.interface.refresh({
                    size: "sm",
                    className: loadingFiles ? "animate-spin" : "",
                  })}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Actualizar lista de archivos</TooltipContent>
            </Tooltip>
          </div>
          {loadingFiles ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : (
            <FileList files={uploadedFiles} onDelete={handleDeleteFile} />
          )}
        </div>
      </div>
    </Modal>
  );
};
