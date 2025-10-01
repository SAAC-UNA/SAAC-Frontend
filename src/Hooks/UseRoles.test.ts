import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRoles } from './UseRoles';

// Mock del servicio de roles
jest.mock('@/services/RoleService', () => ({
  roleService: {
    crearRol: jest.fn(),
    editarRol: jest.fn(),
    eliminarRol: jest.fn(),
    obtenerRol: jest.fn(),
    obtenerPermisos: jest.fn(),
    listarRoles: jest.fn(),
  },
}));

const mockRoleService = require('@/services/RoleService').roleService;

describe('useRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicializa con valores por defecto', () => {
    const { result } = renderHook(() => useRoles());
    
    expect(result.current.roles).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.availablePermissions).toEqual([]);
  });

  it('loadRoles actualiza el estado correctamente', async () => {
    const mockRoles = [
      { id: 1, name: 'Admin', description: 'Administrator role', permissions: ['read', 'write'] },
      { id: 2, name: 'User', description: 'Regular user role', permissions: ['read'] }
    ];
    
    mockRoleService.listarRoles.mockResolvedValue({ data: mockRoles });
    
    const { result } = renderHook(() => useRoles());
    
    await act(async () => {
      await result.current.loadRoles();
    });
    
    expect(result.current.roles).toEqual(mockRoles);
    expect(result.current.error).toBeNull();
  });

  it('maneja errores en loadRoles', async () => {
    const errorMessage = 'Network error';
    mockRoleService.listarRoles.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useRoles());
    
    await act(async () => {
      await result.current.loadRoles();
    });
    
    // El hook agrega un prefijo al mensaje de error
    expect(result.current.error).toBe(`Error al cargar roles: ${errorMessage}`);
  });

  it('createRole añade un nuevo rol', async () => {
    const newRoleData = { 
      name: 'New Role', 
      description: 'New role description',
      permissions: ['read']
    };
    const newRole = { id: 3, ...newRoleData };
    
    mockRoleService.crearRol.mockResolvedValue({ data: newRole });
    
    const { result } = renderHook(() => useRoles());
    
    await act(async () => {
      await result.current.createRole(newRoleData);
    });
    
    expect(result.current.roles).toContain(newRole);
    expect(mockRoleService.crearRol).toHaveBeenCalledWith(newRoleData);
  });

  it('editRole actualiza un rol existente', async () => {
    const roleId = 1;
    const updatedData = { 
      name: 'Updated Role', 
      description: 'Updated description',
      permissions: ['read', 'write']
    };
    const updatedRole = { id: roleId, ...updatedData };
    
    mockRoleService.editarRol.mockResolvedValue({ data: updatedRole });
    
    const { result } = renderHook(() => useRoles());
    
    await act(async () => {
      await result.current.editRole(roleId, updatedData);
    });
    
    expect(mockRoleService.editarRol).toHaveBeenCalledWith(roleId, updatedData);
  });

  it('deleteRole elimina un rol', async () => {
    const roleId = 1;
    
    mockRoleService.eliminarRol.mockResolvedValue({ data: true });
    
    const { result } = renderHook(() => useRoles());
    
    await act(async () => {
      await result.current.deleteRole(roleId);
    });
    
    expect(mockRoleService.eliminarRol).toHaveBeenCalledWith(roleId);
  });

  it('clearError limpia los errores', () => {
    const { result } = renderHook(() => useRoles());
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('loadPermissions carga permisos disponibles', async () => {
    const mockPermissions = [
      { id: 1, name: 'read', label: 'Read' },
      { id: 2, name: 'write', label: 'Write' }
    ];
    
    mockRoleService.obtenerPermisos.mockResolvedValue({ data: mockPermissions });
    
    const { result } = renderHook(() => useRoles());
    
    const result_permissions = await act(async () => {
      return await result.current.loadPermissions();
    });
    
    expect(mockRoleService.obtenerPermisos).toHaveBeenCalled();
    expect(result_permissions).toEqual(mockPermissions);
  });
});