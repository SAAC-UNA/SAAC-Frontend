/**
 * Tests para LoadingSpinner
 * Cubre: todas las variantes (bounce, spinner, uploading, paging),
 * tamaños, colores y accesibilidad
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from './Loading';

describe('LoadingSpinner', () => {
  describe('variante bounce (por defecto)', () => {
    it('renderiza con role="status"', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renderiza 3 puntos para la animación bounce', () => {
      const { container } = render(<LoadingSpinner variant="bounce" />);
      // Los 3 puntos son divs hijos del contenedor de status
      const dots = container.querySelectorAll('[role="status"] > div');
      expect(dots).toHaveLength(3);
    });

    it('tiene texto accesible aria-label', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando...');
    });
  });

  describe('variante spinner', () => {
    it('renderiza un div con animate-spin', () => {
      const { container } = render(<LoadingSpinner variant="spinner" />);
      const spinner = container.querySelector('[role="status"]');
      expect(spinner?.className).toMatch(/animate-spin/);
    });

    it('renderiza con role="status"', () => {
      render(<LoadingSpinner variant="spinner" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('variante paging', () => {
    it('renderiza con role="status"', () => {
      render(<LoadingSpinner variant="paging" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('contiene el div con clase saac-loader-paging', () => {
      const { container } = render(<LoadingSpinner variant="paging" />);
      expect(container.querySelector('.saac-loader-paging')).toBeInTheDocument();
    });

    it('tiene texto accesible aria-label', () => {
      render(<LoadingSpinner variant="paging" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando...');
    });

    it('aplica className adicional al contenedor', () => {
      const { container } = render(
        <LoadingSpinner variant="paging" className="mi-clase-extra" />
      );
      expect(container.firstChild).toHaveClass('mi-clase-extra');
    });
  });

  describe('variante uploading', () => {
    it('renderiza con aria-label="Subiendo..."', () => {
      render(<LoadingSpinner variant="uploading" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Subiendo...');
    });
  });

  describe('tamaños', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'renderiza sin errores con size="%s" en variante bounce',
      (size) => {
        expect(() =>
          render(<LoadingSpinner variant="bounce" size={size} />)
        ).not.toThrow();
      }
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'renderiza sin errores con size="%s" en variante spinner',
      (size) => {
        const { container } = render(<LoadingSpinner variant="spinner" size={size} />);
        expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      }
    );
  });

  describe('colores', () => {
    it.each(['primary', 'secondary', 'white', 'gray', 'current', 'loading'] as const)(
      'renderiza sin errores con color="%s"',
      (color) => {
        expect(() =>
          render(<LoadingSpinner variant="bounce" color={color} />)
        ).not.toThrow();
      }
    );
  });

  describe('className', () => {
    it('aplica className adicional en variante bounce', () => {
      const { container } = render(
        <LoadingSpinner variant="bounce" className="test-extra" />
      );
      expect(container.firstChild).toHaveClass('test-extra');
    });

    it('aplica className adicional en variante spinner', () => {
      const { container } = render(
        <LoadingSpinner variant="spinner" className="test-extra" />
      );
      expect(container.firstChild).toHaveClass('test-extra');
    });
  });
});
