import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import React from 'react';

describe('Input', () => {
  it('renderiza el label correctamente', () => {
    render(<Input label="Nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('muestra el asterisco si es requerido', () => {
    render(<Input label="Correo" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renderiza el input y permite escribir', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hola' } });
    expect(input).toHaveValue('Hola');
  });

  it('muestra el mensaje de error si existe', () => {
    render(<Input error="Campo obligatorio" />);
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument();
  });

  it('muestra el helperText si no hay error', () => {
    render(<Input helperText="Ayuda" />);
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });

  it('deshabilita el input si disabled es true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
