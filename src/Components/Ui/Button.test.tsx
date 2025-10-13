import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';
import React from 'react';

describe('Button', () => {
  it('renderiza el texto del botón', () => {
    render(<Button>Crear Rol</Button>);
    expect(screen.getByText('Crear Rol')).toBeInTheDocument();
  });

  it('aplica la variante primary por defecto', () => {
    render(<Button>Texto</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/azul-una/);
  });

  it('deshabilita el botón cuando isLoading es true', () => {
    render(<Button isLoading>Texto</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deshabilita el botón cuando disabled es true', () => {
    render(<Button disabled>Texto</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('llama onClick cuando se hace click', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
