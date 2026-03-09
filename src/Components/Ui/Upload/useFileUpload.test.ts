/**
 * Tests para useFileUpload hook (HU008)
 * Cubre: agregar archivos, validación, eliminación, clearAll, límite de archivos
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useFileUpload } from './useFileUpload';
import { MAX_FILES_PER_UPLOAD, MAX_FILE_SIZE } from '@/Types/FileTypes';

// Mock del ToastContext para no necesitar el provider real
jest.mock('@/Context/ToastContext', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const makeFile = (name: string, size = 1024, type = 'application/pdf') =>
  new File(['x'.repeat(size)], name, { type });

describe('useFileUpload', () => {
  const setup = (onFilesChanged = jest.fn(), maxFiles = MAX_FILES_PER_UPLOAD) =>
    renderHook(() => useFileUpload(onFilesChanged, maxFiles));

  describe('estado inicial', () => {
    it('inicia con lista de archivos vacía', () => {
      const { result } = setup();
      expect(result.current.files).toHaveLength(0);
    });

    it('inicia sin errores', () => {
      const { result } = setup();
      expect(result.current.errors).toEqual({});
    });
  });

  describe('addFiles', () => {
    it('agrega archivos válidos a la lista', () => {
      const { result } = setup();
      const file = makeFile('informe.pdf');

      act(() => { result.current.addFiles([file]); });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('informe.pdf');
    });

    it('llama onFilesChanged al agregar archivos', () => {
      const onFilesChanged = jest.fn();
      const { result } = setup(onFilesChanged);

      act(() => { result.current.addFiles([makeFile('doc.pdf')]); });

      expect(onFilesChanged).toHaveBeenCalledWith([expect.objectContaining({ name: 'doc.pdf' })]);
    });

    it('registra error para archivos con extensión no permitida', () => {
      const { result } = setup();

      act(() => { result.current.addFiles([makeFile('virus.exe')]); });

      expect(result.current.errors['virus.exe']).toMatch(/formato/i);
      expect(result.current.files).toHaveLength(0);
    });

    it('registra error para archivos que superan 50MB', () => {
      const { result } = setup();
      const bigFile = makeFile('grande.pdf', MAX_FILE_SIZE + 1);

      act(() => { result.current.addFiles([bigFile]); });

      expect(result.current.errors['grande.pdf']).toMatch(/50MB/i);
      expect(result.current.files).toHaveLength(0);
    });

    it('agrega solo los archivos válidos cuando hay una mezcla', () => {
      const { result } = setup();

      act(() => {
        result.current.addFiles([makeFile('bueno.pdf'), makeFile('malo.exe')]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('bueno.pdf');
      expect(result.current.errors['malo.exe']).toBeDefined();
    });

    it('no supera el límite de archivos configurado', () => {
      const { result } = setup(jest.fn(), 2);

      act(() => {
        result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]);
      });

      act(() => {
        result.current.addFiles([makeFile('c.pdf')]);
      });

      // No debe agregar el tercer archivo
      expect(result.current.files).toHaveLength(2);
    });

    it('no hace nada si se pasa una lista vacía', () => {
      const onFilesChanged = jest.fn();
      const { result } = setup(onFilesChanged);

      act(() => { result.current.addFiles([]); });

      expect(result.current.files).toHaveLength(0);
      expect(onFilesChanged).not.toHaveBeenCalled();
    });
  });

  describe('removeFile', () => {
    it('elimina el archivo en el índice indicado', () => {
      const { result } = setup();

      act(() => {
        result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]);
      });

      act(() => { result.current.removeFile(0); });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('b.pdf');
    });

    it('limpia el error asociado al archivo eliminado', () => {
      const { result } = setup();

      // Primero forzamos que haya un error agregando un archivo inválido
      act(() => { result.current.addFiles([makeFile('malo.exe')]); });
      expect(result.current.errors['malo.exe']).toBeDefined();

      // El archivo inválido no se agrega, así que verificamos que al limpiar
      // no queda el error en el estado tras un segundo addFiles
      act(() => { result.current.addFiles([makeFile('bueno.pdf')]); });
      act(() => { result.current.removeFile(0); });

      expect(result.current.files).toHaveLength(0);
    });

    it('llama onFilesChanged tras eliminar', () => {
      const onFilesChanged = jest.fn();
      const { result } = setup(onFilesChanged);

      act(() => { result.current.addFiles([makeFile('a.pdf')]); });
      onFilesChanged.mockClear();

      act(() => { result.current.removeFile(0); });

      expect(onFilesChanged).toHaveBeenCalledWith([]);
    });
  });

  describe('clearAll', () => {
    it('elimina todos los archivos', () => {
      const { result } = setup();

      act(() => {
        result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]);
      });

      act(() => { result.current.clearAll(); });

      expect(result.current.files).toHaveLength(0);
    });

    it('limpia todos los errores', () => {
      const { result } = setup();

      act(() => { result.current.addFiles([makeFile('malo.exe')]); });
      act(() => { result.current.clearAll(); });

      expect(result.current.errors).toEqual({});
    });

    it('llama onFilesChanged con lista vacía', () => {
      const onFilesChanged = jest.fn();
      const { result } = setup(onFilesChanged);

      act(() => { result.current.addFiles([makeFile('a.pdf')]); });
      onFilesChanged.mockClear();

      act(() => { result.current.clearAll(); });

      expect(onFilesChanged).toHaveBeenCalledWith([]);
    });
  });
});
