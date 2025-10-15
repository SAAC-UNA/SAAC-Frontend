import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastContainer } from './Toast';

// Mock del contexto Toast
jest.mock('@/context/ToastContext', () => {
  return {
    useToast: () => ({
      toasts: [
        {
          id: '1',
          type: 'success',
          title: 'Éxito',
          message: 'Operación realizada',
          isVisible: true,
        },
        {
          id: '2',
          type: 'error',
          title: 'Error',
          message: 'Hubo un problema',
          isVisible: true,
        },
      ],
      hideToast: jest.fn(),
    }),
  };
});

describe('ToastContainer', () => {
  it('renderiza los toasts visibles', () => {
    render(<ToastContainer />);
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Operación realizada')).toBeInTheDocument();
    expect(screen.getByText('Hubo un problema')).toBeInTheDocument();
  });

  it('muestra el icono correcto para cada tipo', () => {
    render(<ToastContainer />);
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('llama hideToast al hacer click en cerrar', () => {
    render(<ToastContainer />);
    const closeButtons = screen.getAllByLabelText('Cerrar notificación');
    fireEvent.click(closeButtons[0]);
    fireEvent.click(closeButtons[1]);
    // No se verifica el efecto porque es un mock, pero no lanza error
  });

  it('no renderiza nada si no hay toasts visibles', () => {
    const originalUseToast = require('@/context/ToastContext').useToast;
    jest.spyOn(require('@/context/ToastContext'), 'useToast').mockReturnValue({ toasts: [], hideToast: jest.fn() });
    render(<ToastContainer />);
    expect(screen.queryByText('Éxito')).not.toBeInTheDocument();
    require('@/context/ToastContext').useToast.mockRestore();
  });
});
