import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { RolesTable } from './RolesTable';

// Mock de los hooks y contextos necesarios
const mockDeleteRole = jest.fn();
const mockNavigate = jest.fn();

const mockRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Rol con permisos completos',
    permissions: ['read', 'write', 'delete']
  },
  {
    id: 2,
    name: 'Usuario',
    description: 'Rol básico de usuario',
    permissions: ['read']
  },
  {
    id: 3,
    name: 'Editor',
    description: 'Rol de edición',
    permissions: ['read', 'write']
  }
];

jest.mock('@/hooks/UseRoles', () => ({
  useRoles: () => ({
    roles: mockRoles,
    isLoading: false,
    error: null,
    loadRoles: jest.fn(),
    deleteRole: mockDeleteRole,
  }),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('RolesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza la tabla de roles correctamente', () => {
    render(<RolesTable />);
    
    expect(screen.getByText('Lista de Roles')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('muestra las columnas esperadas', () => {
    render(<RolesTable />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Permisos')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('renderiza botones de acción para cada rol', () => {
    render(<RolesTable />);
    
    // Debe haber botones de editar y eliminar para cada rol usando title (no aria-label)
    const editButtons = screen.getAllByTitle(/editar/i);
    const deleteButtons = screen.getAllByTitle(/eliminar/i);
    
    expect(editButtons).toHaveLength(3); // 3 roles = 3 botones editar
    expect(deleteButtons).toHaveLength(3); // 3 roles = 3 botones eliminar
  });

  it('llama al callback onEdit cuando se hace click en editar', () => {
    const mockOnEdit = jest.fn();
    render(<RolesTable onEdit={mockOnEdit} />);
    
    const firstEditButton = screen.getAllByTitle(/editar/i)[0];
    fireEvent.click(firstEditButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockRoles[0]);
  });

  it('llama al callback onDelete cuando se hace click en eliminar', () => {
    const mockOnDelete = jest.fn();
    render(<RolesTable onDelete={mockOnDelete} />);
    
    const firstDeleteButton = screen.getAllByTitle(/eliminar/i)[0];
    fireEvent.click(firstDeleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockRoles[0]);
  });

  it('permite buscar/filtrar roles', () => {
    render(<RolesTable />);
    
    // Buscar campo de búsqueda
    const searchInput = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement;
    
    expect(searchInput).toBeInTheDocument();
    
    // Testear que el input existe y puede recibir texto
    fireEvent.change(searchInput, { target: { value: 'Admin' } });
    expect(searchInput.value).toBe('Admin');
  });
});