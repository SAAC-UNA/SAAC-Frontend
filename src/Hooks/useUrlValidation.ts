/**
 * useUrlValidation - Hook para validación de URLs
 * Valida que las URLs sean correctas antes de enviarlas al backend
 */

import { URL_REGEX, MAX_URL_LENGTH } from '@/Types/FileTypes';

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida una URL individual
 */
export const validateUrl = (url: string): UrlValidationResult => {
  // Eliminar espacios en blanco
  const trimmedUrl = url.trim();

  // Validar que no esté vacía
  if (!trimmedUrl) {
    return {
      isValid: false,
      error: 'La URL no puede estar vacía'
    };
  }

  // Validar longitud máxima
  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: `La URL no puede superar ${MAX_URL_LENGTH} caracteres`
    };
  }

  // Validar formato HTTP/HTTPS
  if (!URL_REGEX.test(trimmedUrl)) {
    return {
      isValid: false,
      error: 'La URL debe comenzar con http:// o https://'
    };
  }

  // Validar que sea una URL válida
  try {
    new URL(trimmedUrl);
    return {
      isValid: true
    };
  } catch {
    return {
      isValid: false,
      error: 'La URL no tiene un formato válido'
    };
  }
};

/**
 * Valida un array de URLs
 */
export const validateUrls = (urls: string[]): {
  valid: string[];
  invalid: Array<{ url: string; error: string }>;
} => {
  const valid: string[] = [];
  const invalid: Array<{ url: string; error: string }> = [];

  urls.forEach(url => {
    const result = validateUrl(url);
    if (result.isValid) {
      valid.push(url.trim());
    } else {
      invalid.push({
        url: url,
        error: result.error || 'URL inválida'
      });
    }
  });

  return { valid, invalid };
};

/**
 * Hook para validación de URLs
 */
export const useUrlValidation = () => {
  return {
    validateUrl,
    validateUrls
  };
};
