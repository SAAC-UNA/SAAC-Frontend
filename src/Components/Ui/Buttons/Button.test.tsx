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

  describe('estado de loading mejorado', () => {
    it('no debe mostrar spinner cuando isLoading es true', () => {
      render(<Button isLoading>Cargando</Button>);
      
      // Verificar que no hay spinner (no debe existir role="status")
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      
      // Verificar que el botón está deshabilitado
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe deshabilitar el botón cuando isLoading es true', () => {
      render(<Button isLoading>Procesando</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe deshabilitar cuando isLoading y disabled son true', () => {
      render(<Button isLoading disabled>Múltiple disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe bloquear eventos onClick cuando isLoading es true', () => {
      const handleClick = jest.fn();
      render(<Button isLoading onClick={handleClick}>No clickeable</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // No debe haberse ejecutado el click
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('debe permitir cambio de texto durante loading', () => {
      const { rerender } = render(<Button isLoading={false}>Guardar</Button>);
      expect(screen.getByText('Guardar')).toBeInTheDocument();
      
      rerender(<Button isLoading={true}>Guardando...</Button>);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe funcionar normalmente cuando isLoading es false', () => {
      const handleClick = jest.fn();
      render(<Button isLoading={false} onClick={handleClick}>Normal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button.className).not.toMatch(/opacity-50/);
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('variantes y tamaños', () => {
    it('debe aplicar variante secondary correctamente', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/border-2/);
    });

    it('debe aplicar tamaño grande correctamente', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/px-component-lg/);
    });

    it('debe aplicar fullWidth correctamente', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/w-full/);
    });
  });

  describe('casos de uso realistas', () => {
    it('simula flujo de guardado con loading', async () => {
      const mockSave = jest.fn();
      let isLoading = false;
      
      const TestComponent = () => {
        const [loading, setLoading] = React.useState(false);
        
        const handleSave = async () => {
          setLoading(true);
          await mockSave();
          setLoading(false);
        };
        
        return (
          <Button isLoading={loading} onClick={handleSave}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        );
      };
      
      render(<TestComponent />);
      
      // Estado inicial
      const button = screen.getByRole('button');
      expect(screen.getByText('Guardar')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      
      // Simular click (esto activaría loading en un caso real)
      fireEvent.click(button);
      expect(mockSave).toHaveBeenCalled();
    });

    it('debe manejar estados condicionales complejos', () => {
      const { rerender } = render(
        <Button disabled={false} isLoading={false}>
          Estado Normal
        </Button>
      );
      
      let button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button.className).not.toMatch(/opacity-50/);
      
      // Cambiar a loading
      rerender(
        <Button disabled={false} isLoading={true}>
          Procesando...
        </Button>
      );
      
      button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      // Cambiar a disabled
      rerender(
        <Button disabled={true} isLoading={false}>
          Deshabilitado
        </Button>
      );
      
      button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
