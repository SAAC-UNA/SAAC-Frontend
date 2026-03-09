/**
 * Tests para utilidades de FileTypes (HU008)
 * Cubre: getFileCategory, formatFileSize, validateFile
 */

import {
  getFileCategory,
  formatFileSize,
  validateFile,
  MAX_FILE_SIZE,
} from './FileTypes';

describe('getFileCategory', () => {
  it.each([
    ['documento.pdf', 'document'],
    ['informe.doc', 'document'],
    ['informe.docx', 'document'],
    ['datos.xls', 'spreadsheet'],
    ['datos.xlsx', 'spreadsheet'],
    ['presentacion.ppt', 'presentation'],
    ['presentacion.pptx', 'presentation'],
    ['foto.jpg', 'image'],
    ['foto.jpeg', 'image'],
    ['foto.png', 'image'],
    ['foto.webp', 'image'],
    ['video.mp4', 'video'],
    ['video.avi', 'video'],
    ['video.mov', 'video'],
    ['video.wmv', 'video'],
    ['video.mkv', 'video'],
    ['video.webm', 'video'],
    ['archivo.zip', 'archive'],
    ['archivo.rar', 'archive'],
    ['archivo.7z', 'archive'],
    ['desconocido.xyz', 'other'],
    ['sin_extension', 'other'],
  ])('clasifica "%s" como "%s"', (filename, expected) => {
    expect(getFileCategory(filename)).toBe(expected);
  });

  it('es insensible a mayúsculas en la extensión', () => {
    expect(getFileCategory('DOCUMENTO.PDF')).toBe('document');
    expect(getFileCategory('Foto.JPG')).toBe('image');
  });
});

describe('formatFileSize', () => {
  it('muestra 0 Bytes cuando el tamaño es 0', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formatea bytes menores a 1KB como Bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formatea exactamente 1KB correctamente', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formatea kilobytes correctamente', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formatea megabytes correctamente', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('formatea 50MB (límite máximo) correctamente', () => {
    expect(formatFileSize(MAX_FILE_SIZE)).toBe('50 MB');
  });
});

describe('validateFile', () => {
  const makeFile = (name: string, size: number = 1024): File =>
    new File(['x'.repeat(size)], name, { type: 'application/pdf' });

  it('acepta un PDF válido dentro del límite de tamaño', () => {
    const result = validateFile(makeFile('informe.pdf'));
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('acepta formatos permitidos: docx, xlsx, pptx, jpg, mp4, zip', () => {
    const formats = ['doc.docx', 'tabla.xlsx', 'slides.pptx', 'foto.jpg', 'clip.mp4', 'pack.zip'];
    formats.forEach((name) => {
      expect(validateFile(makeFile(name)).isValid).toBe(true);
    });
  });

  it('rechaza archivos que superan 50MB', () => {
    const bigFile = makeFile('grande.pdf', MAX_FILE_SIZE + 1);
    const result = validateFile(bigFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/50MB/i);
  });

  it('rechaza extensiones no permitidas', () => {
    const result = validateFile(makeFile('script.exe'));
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/formato/i);
  });

  it('rechaza archivos sin extensión', () => {
    const result = validateFile(makeFile('sinextension'));
    expect(result.isValid).toBe(false);
  });
});
