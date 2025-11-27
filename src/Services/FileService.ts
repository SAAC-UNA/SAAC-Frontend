/**
 * FileService - Servicio para operaciones con archivos (HU008)
 * Integración con backend Laravel para subida de evidencias
 */

import { axiosInstance } from '@/Config/axios';
import type {
  FileModel,
  FileUploadResponse,
  MultipleFileUploadResponse,
  FileListResponse,
  FileDeleteResponse,
  FileListParams
} from '@/Types/FileTypes';

const BASE_URL = '/api/archivos';

export const fileService = {
  /**
   * Sube un archivo individual al servidor
   * POST /api/archivos
   */
  uploadFile: async (
    file: File,
    evidenciaId: number,
    procesoId: number,
    onProgress?: (progress: number) => void
  ): Promise<FileModel> => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('evidencia_id', evidenciaId.toString());
    formData.append('proceso_id', procesoId.toString());

    try {
      const response = await axiosInstance.post<FileUploadResponse>(
        BASE_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al subir el archivo');
      }

      return response.data.data;
    } catch (error: any) {
      // Manejar errores de validación del backend
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors || {})[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : 'Error de validación'
        );
      }

      if (error.response?.status === 401) {
        throw new Error('Usuario no autenticado. Por favor, inicie sesión.');
      }

      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para subir archivos a esta evidencia.');
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Error al subir el archivo'
      );
    }
  },

  /**
   * Sube múltiples archivos simultáneamente (máximo 5)
   * POST /api/archivos con archivos[] array
   */
  uploadMultipleFiles: async (
    files: File[],
    evidenciaId: number,
    procesoId: number,
    onProgress?: (progress: number) => void
  ): Promise<{ successful: FileModel[]; failed: Array<{ file: File; error: string }> }> => {
    const formData = new FormData();
    
    // Agregar todos los archivos al FormData
    files.forEach(file => {
      formData.append('archivos[]', file);
    });
    
    formData.append('evidencia_id', evidenciaId.toString());
    formData.append('proceso_id', procesoId.toString());

    try {
      const response = await axiosInstance.post<MultipleFileUploadResponse>(
        BASE_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      // Manejar respuesta exitosa o parcial (status 201 o 207)
      const successful = response.data.data || [];
      const failed: Array<{ file: File; error: string }> = [];

      // Si hay errores en la respuesta (status 207)
      if (response.data.errores && response.data.errores.length > 0) {
        response.data.errores.forEach(error => {
          const failedFile = files[error.indice];
          if (failedFile) {
            failed.push({
              file: failedFile,
              error: error.error
            });
          }
        });
      }

      return { successful, failed };

    } catch (error: any) {
      // Si falla completamente, todos los archivos fallan
      const errorMessage = error.response?.data?.message || error.message || 'Error al subir archivos';
      
      // Manejar errores de validación (422)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors || {})[0];
        const message = Array.isArray(firstError) ? firstError[0] : errorMessage;
        
        return {
          successful: [],
          failed: files.map(file => ({
            file,
            error: message
          }))
        };
      }

      // Errores de autenticación o permisos
      if (error.response?.status === 401) {
        throw new Error('Usuario no autenticado. Por favor, inicie sesión.');
      }

      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para subir archivos a esta evidencia.');
      }

      // Error general - todos los archivos fallan
      return {
        successful: [],
        failed: files.map(file => ({
          file,
          error: errorMessage
        }))
      };
    }
  },

  /**
   * Lista archivos por evidencia o proceso
   * GET /api/archivos?evidencia_id={id}&proceso_id={id}
   */
  listFiles: async (params: FileListParams): Promise<FileModel[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.evidencia_id) {
        queryParams.append('evidencia_id', params.evidencia_id.toString());
      }
      if (params.proceso_id) {
        queryParams.append('proceso_id', params.proceso_id.toString());
      }

      const response = await axiosInstance.get<FileListResponse>(
        `${BASE_URL}?${queryParams.toString()}`
      );

      if (!response.data.success) {
        throw new Error('Error al obtener la lista de archivos');
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener archivos'
      );
    }
  },

  /**
   * Obtiene metadatos de un archivo específico
   * GET /api/archivos/{id}
   */
  getFile: async (archivoId: number): Promise<FileModel> => {
    try {
      const response = await axiosInstance.get<FileUploadResponse>(
        `${BASE_URL}/${archivoId}`
      );

      if (!response.data.success) {
        throw new Error('Error al obtener el archivo');
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener el archivo'
      );
    }
  },

  /**
   * Elimina un archivo
   * DELETE /api/archivos/{id}
   */
  deleteFile: async (archivoId: number): Promise<void> => {
    try {
      const response = await axiosInstance.delete<FileDeleteResponse>(
        `${BASE_URL}/${archivoId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar el archivo');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para eliminar este archivo.');
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Error al eliminar el archivo'
      );
    }
  },

  /**
   * Hace público un archivo (genera enlace público)
   * POST /api/archivos/{id}/make-public
   */
  makePublic: async (archivoId: number, expiresAt?: string): Promise<FileModel> => {
    try {
      const response = await axiosInstance.post<FileUploadResponse>(
        `${BASE_URL}/${archivoId}/make-public`,
        expiresAt ? { expires_at: expiresAt } : {}
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al hacer público el archivo');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para hacer público este archivo.');
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Error al hacer público el archivo'
      );
    }
  },

  /**
   * Revoca el acceso público de un archivo
   * POST /api/archivos/{id}/revoke-public
   */
  revokePublic: async (archivoId: number): Promise<FileModel> => {
    try {
      const response = await axiosInstance.post<FileUploadResponse>(
        `${BASE_URL}/${archivoId}/revoke-public`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al revocar acceso público');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para revocar el acceso público.');
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Error al revocar acceso público'
      );
    }
  },
};
