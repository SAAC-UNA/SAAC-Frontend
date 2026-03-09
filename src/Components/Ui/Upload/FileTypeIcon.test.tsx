/**
 * Tests para FileTypeIcon
 * Verifica que se renderiza un SVG para cada categoría de archivo
 */

import React from 'react';
import { render, container } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileTypeIcon } from './FileTypeIcon';

// Función auxiliar: obtiene el SVG renderizado
const getSvg = (filename: string, isLink = false) => {
  const { container: c } = render(
    <FileTypeIcon filename={filename} isLink={isLink} />
  );
  return c.querySelector('svg');
};

describe('FileTypeIcon', () => {
  it('renderiza un SVG para un documento PDF', () => {
    expect(getSvg('informe.pdf')).toBeInTheDocument();
  });

  it('renderiza un SVG para una hoja de cálculo', () => {
    expect(getSvg('datos.xlsx')).toBeInTheDocument();
  });

  it('renderiza un SVG para una presentación', () => {
    expect(getSvg('slides.pptx')).toBeInTheDocument();
  });

  it('renderiza un SVG para una imagen', () => {
    expect(getSvg('foto.png')).toBeInTheDocument();
  });

  it('renderiza un SVG para un video', () => {
    expect(getSvg('clip.mp4')).toBeInTheDocument();
  });

  it('renderiza un SVG para un archivo comprimido', () => {
    expect(getSvg('pack.zip')).toBeInTheDocument();
  });

  it('renderiza un SVG para un archivo desconocido', () => {
    expect(getSvg('archivo.xyz')).toBeInTheDocument();
  });

  it('renderiza el ícono de enlace cuando isLink=true independientemente del nombre', () => {
    const svgLink = getSvg('cualquier_nombre.pdf', true);
    const svgDoc  = getSvg('cualquier_nombre.pdf', false);
    expect(svgLink).toBeInTheDocument();
    expect(svgDoc).toBeInTheDocument();
    // Los dos SVGs deben existir; el de enlace y el de documento son distintos
    expect(svgLink?.outerHTML).not.toBe(svgDoc?.outerHTML);
  });

  it('acepta una prop className y la aplica al SVG', () => {
    const { container: c } = render(
      <FileTypeIcon filename="doc.pdf" className="mi-clase-test" />
    );
    const svg = c.querySelector('svg');
    // En SVG, className es SVGAnimatedString; usamos getAttribute
    expect(svg?.getAttribute('class')).toMatch(/mi-clase-test/);
  });

  it('renderiza correctamente con diferentes tamaños', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { container: c } = render(
        <FileTypeIcon filename="doc.pdf" size={size} />
      );
      expect(c.querySelector('svg')).toBeInTheDocument();
    });
  });
});
