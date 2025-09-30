import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renderiza el mensaje y el icono en modo avanzado', () => {
    render(<Modal {...defaultProps} variant="danger" message="¿Está seguro?" />);
    expect(screen.getByText('¿Está seguro?')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('llama onConfirm al hacer click en el botón de confirmar', () => {
    const onConfirm = jest.fn();
    render(<Modal {...defaultProps} variant="danger" message="¿Está seguro?" onConfirm={onConfirm} />);
    const confirmBtn = screen.getByText('Confirmar');
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('no renderiza nada si isOpen es false', () => {
    render(<Modal {...defaultProps} isOpen={false}>Contenido</Modal>);
    expect(screen.queryByText('Título del Modal')).not.toBeInTheDocument();
  });
});
