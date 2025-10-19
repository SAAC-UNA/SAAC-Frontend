import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { DataTable } from './DataTable';

// Datos de prueba
const mockData = [
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'Admin' },
  { id: 2, name: 'María García', email: 'maria@email.com', role: 'User' },
  { id: 3, name: 'Carlos López', email: 'carlos@email.com', role: 'Editor' }
];

const mockColumns = [
  {
    key: 'name',
    header: 'Nombre',
    accessor: 'name' as keyof typeof mockData[0],
  },
  {
    key: 'email',
    header: 'Email',
    accessor: 'email' as keyof typeof mockData[0],
  },
  {
    key: 'role',
    header: 'Rol',
    accessor: 'role' as keyof typeof mockData[0],
  }
];

describe('DataTable', () => {
  it('renderiza la tabla con datos', () => {
    render(<DataTable data={mockData} columns={mockColumns} title="Tabla de Usuarios" />);
    
    // Verifica headers
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Rol')).toBeInTheDocument();
    
    // Verifica datos
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@email.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay datos', () => {
    render(<DataTable data={[]} columns={mockColumns} title="Tabla Vacía" />);
    
    // Usar getAllByText y verificar que al menos uno está en el documento
    const emptyMessages = screen.getAllByText(/no hay datos/i);
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  it('muestra el título de la tabla', () => {
    render(<DataTable data={mockData} columns={mockColumns} title="Usuarios del Sistema" />);
    
    expect(screen.getByText('Usuarios del Sistema')).toBeInTheDocument();
  });

  it('muestra estado de carga', () => {
    render(<DataTable data={[]} columns={mockColumns} title="Cargando" loading={true} />);
    
    expect(screen.getByRole('status') || screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('aplica filtros de búsqueda cuando es searchable', () => {
    render(<DataTable data={mockData} columns={mockColumns} title="Búsqueda" searchable={true} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renderiza columnas personalizadas con render', () => {
    const customColumns = [
      {
        key: 'name',
        header: 'Nombre',
        accessor: 'name' as keyof typeof mockData[0],
        render: (value: any) => <strong>{value}</strong>
      }
    ];

    render(<DataTable data={mockData} columns={customColumns} title="Custom Render" />);
    
    // El nombre debería estar en negrita debido al render personalizado
    const nameElement = screen.getByText('Juan Pérez');
    expect(nameElement.tagName).toBe('STRONG');
  });

  it('muestra descripción cuando se proporciona', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="Tabla con Descripción"
        description="Esta es una descripción de la tabla"
      />
    );
    
    expect(screen.getByText('Esta es una descripción de la tabla')).toBeInTheDocument();
  });

  it('renderiza botón de acción principal', () => {
    const mockPrimaryAction = {
      label: 'Crear Usuario',
      icon: <span data-testid="icon">+</span>,
      onClick: jest.fn()
    };

    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="Tabla con Acción"
        primaryAction={mockPrimaryAction}
      />
    );
    
    const actionButton = screen.getByText('Crear Usuario');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(mockPrimaryAction.onClick).toHaveBeenCalled();
  });

  it('llama a onSearch cuando se busca', () => {
    const mockOnSearch = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="Búsqueda Callback"
        onSearch={mockOnSearch}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('Juan');
  });

  it('maneja paginación cuando se proporciona', () => {
    const mockPagination = {
      currentPage: 1,
      totalPages: 3,
      onPageChange: jest.fn()
    };

    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="Tabla Paginada"
        pagination={mockPagination}
      />
    );
    
    // Buscar indicadores de paginación
    expect(screen.getByText('1') || screen.getByText(/página/i)).toBeInTheDocument();
  });

  it('renderiza acciones para cada fila', () => {
    const mockActions = [
      {
        icon: <span data-testid="edit-icon">✏️</span>,
        label: 'Editar',
        onClick: jest.fn()
      },
      {
        icon: <span data-testid="delete-icon">🗑️</span>,
        label: 'Eliminar',
        onClick: jest.fn()
      }
    ];

    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="Tabla con Acciones"
        actions={mockActions}
      />
    );
    
    // Debe haber iconos de acción para cada fila
    const editIcons = screen.getAllByTestId('edit-icon');
    const deleteIcons = screen.getAllByTestId('delete-icon');
    
    expect(editIcons).toHaveLength(3); // 3 filas
    expect(deleteIcons).toHaveLength(3); // 3 filas
  });
});