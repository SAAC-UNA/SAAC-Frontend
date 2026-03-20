import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from './Modal';
import React from 'react';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Título del Modal',
  };

  it('renderiza el título correctamente', () => {
    render(<Modal {...defaultProps}>Contenido</Modal>);
    expect(screen.getByText('Título del Modal')).toBeInTheDocument();
  });

  it('renderiza el contenido básico', () => {
    render(<Modal {...defaultProps}>Contenido básico</Modal>);
    expect(screen.getByText('Contenido básico')).toBeInTheDocument();
  });

  it('llama onClose al hacer click en el botón de cerrar', () => {
    render(<Modal {...defaultProps} closable={true} />);
    const closeBtn = screen.getByLabelText(/cerrar modal/i);
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renderiza el hero card con variante y el ícono SVG', () => {
    render(<Modal {...defaultProps} variant="danger">¿Está seguro?</Modal>);
    expect(screen.getByText('¿Está seguro?')).toBeInTheDocument();
    // Verificar que hay SVGs en el documento (ícono en hero card + botón cerrar)
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('llama onConfirm al hacer click en el botón de confirmar', () => {
    const onConfirm = jest.fn();
    render(<Modal {...defaultProps} variant="danger" onConfirm={onConfirm}>¿Está seguro?</Modal>);
    const confirmBtn = screen.getByText('Confirmar');
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('bloquea la confirmación mientras espera una operación asíncrona', async () => {
    let resolveConfirm: (() => void) | undefined;
    const onConfirm = jest.fn(
      () => new Promise<void>((resolve) => {
        resolveConfirm = resolve;
      })
    );

    render(<Modal {...defaultProps} variant="danger" onConfirm={onConfirm}>¿Está seguro?</Modal>);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Procesando' })).toBeInTheDocument();
    });

    const processingButton = screen.getAllByRole('button').find((button) => button.getAttribute('aria-busy') === 'true');
    expect(processingButton).toBeDisabled();

    fireEvent.click(processingButton!);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    resolveConfirm?.();
  });

  it('no renderiza nada si isOpen es false', () => {
    render(<Modal {...defaultProps} isOpen={false}>Contenido</Modal>);
    expect(screen.queryByText('Título del Modal')).not.toBeInTheDocument();
  });
});
