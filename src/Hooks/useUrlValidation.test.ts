import { validateUrl } from './useUrlValidation';
import { MAX_URL_LENGTH } from '@/Types/FileTypes';

describe('validateUrl', () => {
  describe('URL vacía o solo espacios', () => {
    it('falla con string vacío', () => {
      const result = validateUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/vacía/i);
    });

    it('falla con solo espacios', () => {
      const result = validateUrl('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('URLs válidas', () => {
    it('acepta URL con https', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
    });

    it('acepta URL con http', () => {
      expect(validateUrl('http://example.com').isValid).toBe(true);
    });

    it('acepta URL con path y query string', () => {
      expect(validateUrl('https://example.com/ruta?q=valor&otro=123').isValid).toBe(true);
    });

    it('acepta URL con subdominio', () => {
      expect(validateUrl('https://api.example.co.cr/v1/data').isValid).toBe(true);
    });

    it('no devuelve error en URL válida', () => {
      const result = validateUrl('https://example.com');
      expect(result.error).toBeUndefined();
    });
  });

  describe('URLs inválidas', () => {
    it('falla sin protocolo', () => {
      expect(validateUrl('example.com').isValid).toBe(false);
    });

    it('falla con protocolo ftp', () => {
      expect(validateUrl('ftp://example.com').isValid).toBe(false);
    });

    it('falla con URL con espacios internos', () => {
      expect(validateUrl('https://example .com').isValid).toBe(false);
    });

    it('incluye mensaje de error descriptivo', () => {
      const result = validateUrl('no-es-url');
      expect(result.error).toMatch(/http/i);
    });
  });

  describe('longitud máxima', () => {
    it('acepta URL con exactamente MAX_URL_LENGTH caracteres', () => {
      const base = 'https://';
      const path = 'a'.repeat(MAX_URL_LENGTH - base.length);
      const result = validateUrl(base + path);
      expect(result.isValid).toBe(true);
    });

    it('falla con URL que supera MAX_URL_LENGTH', () => {
      const url = 'https://' + 'a'.repeat(MAX_URL_LENGTH);
      const result = validateUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/excede/i);
    });
  });
});
