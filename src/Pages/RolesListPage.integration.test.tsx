import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RolesListPage from './RolesListPage';

// Mock completo del contexto y servicios
const mockRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: 2,
    name: 'Usuario',
    description: 'Acceso básico de usuario',
    permissions: ['read']
  }
];

jest.mock('@/hooks/UseRoles', () => ({
  useRoles: () => ({
    roles: mockRoles,
    isLoading: false,
    error: null,
    loadRoles: jest.fn().mockResolvedValue(mockRoles),
    createRole: jest.fn(),
    editRole: jest.fn(),
    deleteRole: jest.fn().mockResolvedValue(true),
    clearError: jest.fn()
  }),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Wrapper para router
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RolesListPage - Prueba de Integración', () => {
  it('muestra la lista completa de roles al cargar la página', async () => {
    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Verificar que se muestran los roles
    await waitFor(() => {
      expect(screen.getByText('Administrador')).toBeInTheDocument();
      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });

    // Verificar descripciones
    expect(screen.getByText('Acceso completo al sistema')).toBeInTheDocument();
    expect(screen.getByText('Acceso básico de usuario')).toBeInTheDocument();
  });

  it('permite buscar roles por nombre', async () => {
    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Buscar el campo de búsqueda
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    
    // Escribir en el campo de búsqueda
    fireEvent.change(searchInput, { target: { value: 'Admin' } });

    // Verificar que se filtra correctamente
    await waitFor(() => {
      expect(screen.getByText('Administrador')).toBeInTheDocument();
      // El usuario normal no debería aparecer
      expect(screen.queryByText('Usuario')).not.toBeInTheDocument();
    });
  });

  it('navega a crear nuevo rol cuando se hace click en el botón', () => {
    const mockNavigate = jest.fn();
    
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Buscar y hacer click en el botón de crear
    const createButton = screen.getByText(/crear/i) || screen.getByText(/nuevo/i);
    if (createButton) {
      fireEvent.click(createButton);
      expect(mockNavigate).toHaveBeenCalledWith('/roles/crear');
    }
  });

  it('muestra botones de acción para cada rol', () => {
    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Verificar que hay botones de editar y eliminar
    const editButtons = screen.getAllByLabelText(/editar/i);
    const deleteButtons = screen.getAllByLabelText(/eliminar/i);

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('flujo completo: buscar, encontrar rol y hacer click en editar', async () => {
    const mockNavigate = jest.fn();
    
    // Mock actualizado del navigate
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // 1. Buscar un rol específico
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Administrador' } });

    // 2. Verificar que se muestra el rol buscado
    await waitFor(() => {
      expect(screen.getByText('Administrador')).toBeInTheDocument();
    });

    // 3. Hacer click en editar
    const editButton = screen.getByLabelText(/editar.*administrador/i) || screen.getAllByLabelText(/editar/i)[0];
    fireEvent.click(editButton);

    // 4. Verificar navegación
    expect(mockNavigate).toHaveBeenCalledWith('/roles/1/edit');
  });

  it('muestra estado de carga mientras se cargan los roles', () => {
    // Mock del hook con loading = true
    jest.doMock('@/hooks/UseRoles', () => ({
      useRoles: () => ({
        roles: [],
        isLoading: true,
        error: null,
        loadRoles: jest.fn(),
        createRole: jest.fn(),
        editRole: jest.fn(),
        deleteRole: jest.fn(),
        clearError: jest.fn()
      }),
    }));

    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Debería mostrar indicador de carga
    expect(screen.getByRole('status') || screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('maneja errores de carga y los muestra al usuario', () => {
    // Mock del hook con error
    jest.doMock('@/hooks/UseRoles', () => ({
      useRoles: () => ({
        roles: [],
        isLoading: false,
        error: 'Error al cargar roles',
        loadRoles: jest.fn(),
        createRole: jest.fn(),
        editRole: jest.fn(),
        deleteRole: jest.fn(),
        clearError: jest.fn()
      }),
    }));

    render(
      <RouterWrapper>
        <RolesListPage />
      </RouterWrapper>
    );

    // Debería mostrar el mensaje de error
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});