import { URL_REGEX, MAX_URL_LENGTH } from '@/Types/FileTypes';

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUrl = (url: string): UrlValidationResult => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { isValid: false, error: 'La URL no puede estar vacía' };
  }

  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return { isValid: false, error: `La URL excede ${MAX_URL_LENGTH} caracteres` };
  }

  if (!URL_REGEX.test(trimmedUrl)) {
    return { isValid: false, error: 'La URL no es válida. Debe comenzar con http:// o https://' };
  }

  return { isValid: true };
};
