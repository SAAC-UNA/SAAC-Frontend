/**
 * Tipos relacionados con archivos y evidencias (HU008)
 *
 * ⚠️ IMPORTANTE - SEGURIDAD:
 * Las validaciones en este archivo son SOLO para mejorar la experiencia de usuario (UX).
 * NO son una medida de seguridad ya que el código JavaScript puede ser modificado.
 *
 * El backend tiene validaciones independientes y obligatorias en:
 * - StoreFileRequest.php: Valida formato (mimes), tamaño (max:51200) y autorización
 * - FilePolicy.php: Controla acceso basado en roles y asignaciones
 * - FileService.php: Usa UUID para nombres seguros
 *
 * Un atacante NO puede bypass la seguridad modificando este archivo.
 */

// Modelo de archivo según backend
export interface FileModel {
  archivo_id: number;
  nombre_original: string;
  fecha_subida: string;

  // Tipo de evidencia (Backend: enum 'archivo' o 'enlace')
  tipo: "archivo" | "enlace";

  // URL externa (solo para tipo='enlace')
  url?: string | null;

  // Metadatos (solo para tipo='archivo')
  tamanio?: number;
  tipo_mime?: string;
  path?: string | null;

  // Acceso público
  is_publico: boolean;
  url_publica?: string;
  url_publica_carpeta?: string;
  link_expira_en?: string;

  // Relaciones
  evidencia_id: number;
  evidencia?: {
    evidencia_id: number;
    nombre: string;
  };
  usuario_id: number;
  usuario?: {
    usuario_id: number;
    nombre_completo: string;
    email: string;
  };
  proceso_id: number;
  proceso?: {
    proceso_id: number;
    nombre: string;
  };
}

// Respuesta de subida de archivo individual
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: FileModel;
}

// Respuesta de subida múltiple de archivos
export interface MultipleFileUploadResponse {
  success: boolean;
  message: string;
  data: FileModel[];
  count?: number;
  errores?: Array<{
    indice: number;
    nombre: string;
    error: string;
  }>;
}

// Respuesta de listado de archivos
export interface FileListResponse {
  success: boolean;
  data: FileModel[];
}

// Respuesta de eliminación
export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

// Parámetros para listar archivos
export interface FileListParams {
  evidencia_id?: number;
  proceso_id?: number;
  usuario_id?: number;
}

// Estado de subida de archivo
export interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  uploadedFile?: FileModel;
}

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Formatos permitidos (debe coincidir con backend: StoreFileRequest.php línea 38)
 * Backend valida: 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,mp4,avi,mov,wmv,mkv,webm,zip,rar,7z'
 */
export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "mkv",
  "webm",
  "zip",
  "rar",
  "7z",
] as const;

export type AllowedFileExtension = (typeof ALLOWED_FILE_EXTENSIONS)[number];

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * MIME types permitidos para validación en cliente
 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/x-msvideo",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-matroska",
  "video/webm",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
] as const;

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Tamaño máximo de archivo en bytes (debe coincidir con backend)
 * Backend valida: 'max:51200' (51200 KB = 50 MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Número máximo de archivos por request (debe coincidir con backend)
 * Backend valida: 'max:5' en el array de archivos
 */
export const MAX_FILES_PER_UPLOAD = 5;

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Número máximo de enlaces por request (debe coincidir con backend)
 */
export const MAX_LINKS_PER_UPLOAD = 5;

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Longitud máxima de una URL (debe coincidir con backend)
 */
export const MAX_URL_LENGTH = 2048;

/**
 * ⚠️ SOLO PARA UX - NO ES SEGURIDAD
 * Patrón de regex para validar URLs HTTP/HTTPS
 */
export const URL_REGEX = /^https?:\/\/[^\s]+$/;

// Categorías de archivos para iconos y visualización
export type FileCategory =
  | "document"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "video"
  | "archive"
  | "link"
  | "other";

export interface FileCategoryInfo {
  category: FileCategory;
  icon: string;
  color: string;
}

/**
 * Obtiene la categoría de un archivo según su extensión
 */
export function getFileCategory(filename: string): FileCategory {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) return "other";

  if (["pdf", "doc", "docx"].includes(extension)) return "document";
  if (["xls", "xlsx"].includes(extension)) return "spreadsheet";
  if (["ppt", "pptx"].includes(extension)) return "presentation";
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "image";
  if (["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(extension))
    return "video";
  if (["zip", "rar", "7z"].includes(extension)) return "archive";

  return "other";
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * ⚠️ VALIDACIÓN SOLO PARA UX - Feedback inmediato al usuario
 * El backend tiene su propia validación independiente que NO puede ser evadida.
 * Esta función mejora la experiencia evitando intentos de subida que fallarán.
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Validar tamaño (el backend también validará esto)
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo no debe superar los 50MB. Tamaño actual: ${formatFileSize(file.size)}`,
    };
  }

  // Validar extensión
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (
    !extension ||
    !ALLOWED_FILE_EXTENSIONS.includes(extension as AllowedFileExtension)
  ) {
    return {
      isValid: false,
      error: `Formato de archivo no permitido. Formatos válidos: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`,
    };
  }

  return { isValid: true };
}
