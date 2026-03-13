/**
 * Tests para LoadingSpinner
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from './Loading';

describe('LoadingSpinner', () => {
  it('renderiza con role="status"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('contiene el div con clase loader-con', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.loader-con')).toBeInTheDocument();
  });

  it('contiene 6 elementos pfile', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelectorAll('.pfile')).toHaveLength(6);
  });

  it('tiene aria-label="Cargando..."', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('aplica className adicional al contenedor', () => {
    const { container } = render(<LoadingSpinner className="mi-clase-extra" />);
    expect(container.firstChild).toHaveClass('mi-clase-extra');
  });

  it('acepta variant="loader" sin errores', () => {
    expect(() => render(<LoadingSpinner variant="loader" />)).not.toThrow();
  });
});
