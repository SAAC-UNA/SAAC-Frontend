import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import React from 'react';

describe('Button', () => {
  it('renderiza el texto del botón', () => {
    render(<Button>Crear Rol</Button>);
    expect(screen.getByText('Crear Rol')).toBeInTheDocument();
  });

  it('aplica la variante primaria por defecto', () => {
    render(<Button>Texto</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/azul-una/);
  });

  it('muestra el spinner cuando isLoading es true', () => {
    render(<Button isLoading>Texto</Button>);
    expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('deshabilita el botón cuando isLoading o disabled es true', () => {
    render(
      <>
        <Button isLoading>Texto</Button>
        <Button disabled>Texto</Button>
      </>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('llama onClick cuando se hace click', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
