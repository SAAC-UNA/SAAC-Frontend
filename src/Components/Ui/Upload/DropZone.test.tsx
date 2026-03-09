/**
 * Tests para DropZone
 * Cubre: renderizado, interacción con input, drag & drop, estado disabled
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DropZone } from './DropZone';

// Archivo genérico de prueba
const makeFile = (name = 'test.pdf', size = 1024) =>
  new File(['x'.repeat(size)], name, { type: 'application/pdf' });

describe('DropZone', () => {
  describe('renderizado', () => {
    it('muestra el texto principal de arrastre', () => {
      render(<DropZone onFilesSelected={jest.fn()} />);
      expect(screen.getByText(/arrastre archivos aquí/i)).toBeInTheDocument();
    });

    it('muestra el hint por defecto con límite de archivos y tamaño', () => {
      render(<DropZone onFilesSelected={jest.fn()} />);
      // El hint contiene «Hasta N archivos · máx. X MB por archivo»
      expect(screen.getByText(/máx\./i)).toBeInTheDocument();
    });

    it('muestra un hint personalizado cuando se pasa la prop', () => {
      render(<DropZone onFilesSelected={jest.fn()} hint="Solo PDFs, máx 10MB" />);
      expect(screen.getByText('Solo PDFs, máx 10MB')).toBeInTheDocument();
    });

    it('el input tiene data-testid="file-input"', () => {
      render(<DropZone onFilesSelected={jest.fn()} />);
      expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('el input es de tipo file con multiple', () => {
      render(<DropZone onFilesSelected={jest.fn()} />);
      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input.type).toBe('file');
      expect(input.multiple).toBe(true);
    });

    it('el input acepta los formatos indicados en la prop accept', () => {
      render(<DropZone onFilesSelected={jest.fn()} accept=".pdf,.docx" />);
      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input.accept).toBe('.pdf,.docx');
    });
  });

  describe('selección de archivos via input', () => {
    it('llama onFilesSelected con los archivos seleccionados', () => {
      const onFilesSelected = jest.fn();
      render(<DropZone onFilesSelected={onFilesSelected} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file = makeFile();

      fireEvent.change(input, { target: { files: [file] } });

      expect(onFilesSelected).toHaveBeenCalledTimes(1);
      expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it('llama onFilesSelected con múltiples archivos', () => {
      const onFilesSelected = jest.fn();
      render(<DropZone onFilesSelected={onFilesSelected} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const files = [makeFile('a.pdf'), makeFile('b.pdf')];

      fireEvent.change(input, { target: { files } });

      expect(onFilesSelected).toHaveBeenCalledWith(files);
    });

    it('no llama onFilesSelected si no se selecciona ningún archivo', () => {
      const onFilesSelected = jest.fn();
      render(<DropZone onFilesSelected={onFilesSelected} />);

      const input = screen.getByTestId('file-input');
      // FileList vacío: el componente no debe notificar
      fireEvent.change(input, { target: { files: null } });

      expect(onFilesSelected).not.toHaveBeenCalled();
    });
  });

  describe('estado disabled', () => {
    it('el input queda deshabilitado', () => {
      render(<DropZone onFilesSelected={jest.fn()} disabled />);
      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('no llama onFilesSelected al soltar archivos cuando está disabled', () => {
      const onFilesSelected = jest.fn();
      const { container } = render(
        <DropZone onFilesSelected={onFilesSelected} disabled />
      );

      const dropArea = container.firstChild as HTMLElement;
      const file = makeFile();

      fireEvent.drop(dropArea, {
        dataTransfer: { files: [file] },
      });

      expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it('aplica clase de opacidad cuando está disabled', () => {
      const { container } = render(
        <DropZone onFilesSelected={jest.fn()} disabled />
      );
      const dropArea = container.firstChild as HTMLElement;
      expect(dropArea.className).toMatch(/opacity-50/);
    });
  });

  describe('drag & drop', () => {
    it('llama onFilesSelected con los archivos soltados', () => {
      const onFilesSelected = jest.fn();
      const { container } = render(<DropZone onFilesSelected={onFilesSelected} />);

      const dropArea = container.firstChild as HTMLElement;
      const file = makeFile();

      fireEvent.drop(dropArea, {
        dataTransfer: { files: [file] },
      });

      expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });

    it('aplica clases de arrastre activo en dragEnter', () => {
      const { container } = render(<DropZone onFilesSelected={jest.fn()} />);
      const dropArea = container.firstChild as HTMLElement;

      fireEvent.dragEnter(dropArea);
      expect(dropArea.className).toMatch(/border-azul-una/);
    });

    it('elimina las clases de arrastre activo en dragLeave', () => {
      const { container } = render(<DropZone onFilesSelected={jest.fn()} />);
      const dropArea = container.firstChild as HTMLElement;

      fireEvent.dragEnter(dropArea);
      fireEvent.dragLeave(dropArea);
      expect(dropArea.className).not.toMatch(/bg-azul-una/);
    });
  });
});
