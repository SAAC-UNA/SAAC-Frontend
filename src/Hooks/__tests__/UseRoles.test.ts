import { renderHook, act, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { useRoles } from '../UseRoles';
import { roleService } from '../../Services/RoleService';
import type { Role, ApiResponse, CreateRoleData } from '../../Services/RoleService';

// Mock del roleService
jest.mock('../../Services/RoleService', () => ({
  roleService: {
    listarRoles: jest.fn(),
    crearRol: jest.fn(),
    editarRol: jest.fn(),
    eliminarRol: jest.fn(),
    obtenerRol: jest.fn(),
    listarPermisos: jest.fn(),
  }
}));

// Mock de datos para testing
const mockRolesBackend: Role[] = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: [
      { id: 1, name: 'view_users', label: 'Ver Usuarios' },
      { id: 2, name: 'edit_users', label: 'Editar Usuarios' }
    ]
  },
  {
    id: 2,
    name: 'Viewer',
    description: 'Solo lectura',
    permissions: [
      { id: 1, name: 'view_users', label: 'Ver Usuarios' }
    ]
  }
];

const mockPermissions = [
  { value: 'view_users', label: 'Ver Usuarios' },
  { value: 'edit_users', label: 'Editar Usuarios' },
  { value: 'delete_users', label: 'Eliminar Usuarios' }
];

describe('useRoles Hook', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock exitoso por defecto para listarRoles
    const mockedRoleService = jest.mocked(roleService);
    mockedRoleService.listarRoles.mockResolvedValue({
      data: mockRolesBackend,
      message: 'Roles obtenidos exitosamente'
    } as ApiResponse<Role[]>);
    
    mockedRoleService.listarPermisos.mockResolvedValue({
      data: mockPermissions,
      message: 'Permisos obtenidos exitosamente'
    } as any);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('loadRoles', () => {
    it('debe cargar roles exitosamente', async () => {
      const { result } = renderHook(() => useRoles());

      // Estado inicial
      expect(result.current.roles).toEqual([]);
      expect(result.current.isLoading).toBe(false);

      // Cargar roles
      await act(async () => {
        await result.current.loadRoles();
      });

      // Verificar que los datos se cargaron correctamente
      expect(result.current.roles).toHaveLength(2);
      expect(result.current.roles).toEqual(mockRolesBackend);
      expect(result.current.isLoading).toBe(false);
      expect(roleService.listarRoles).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores en loadRoles correctamente', async () => {
      const mockError = new Error('Error de conexión');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.listarRoles.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const resultValue = await result.current.loadRoles();
        expect(resultValue).toBeNull();
      });

      expect(result.current.roles).toEqual([]);
      expect(result.current.error).toContain('Error al cargar roles');
      expect(result.current.isLoading).toBe(false);
    });

    it('debe mostrar estado de loading durante carga', async () => {
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.listarRoles.mockReturnValue(loadingPromise as any);

      const { result } = renderHook(() => useRoles());

      // Iniciar la carga
      act(() => {
        result.current.loadRoles();
      });

      // Debe estar cargando
      expect(result.current.isLoading).toBe(true);

      // Resolver la promesa
      act(() => {
        resolvePromise({ data: mockRolesBackend, message: 'OK' });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('createRole', () => {
    it('debe crear rol exitosamente y agregarlo a la lista', async () => {
      const newRoleData: CreateRoleData = {
        name: 'NewRole',
        description: 'Nuevo rol',
        permissions: ['view_users']
      };

      const newRole: Role = {
        id: 3,
        name: 'NewRole',
        description: 'Nuevo rol',
        permissions: [{ id: 1, name: 'view_users', label: 'Ver Usuarios' }]
      };

      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.crearRol.mockResolvedValueOnce({
        data: newRole,
        message: 'Rol creado exitosamente'
      } as ApiResponse<Role>);

      const { result } = renderHook(() => useRoles());

      // Cargar roles iniciales
      await act(async () => {
        await result.current.loadRoles();
      });

      expect(result.current.roles).toHaveLength(2);

      // Crear nuevo rol
      await act(async () => {
        const createdRole = await result.current.createRole(newRoleData);
        expect(createdRole).toEqual(newRole);
      });

      expect(result.current.roles).toHaveLength(3);
      expect(result.current.roles[2]).toEqual(newRole);
      expect(mockedRoleService.crearRol).toHaveBeenCalledWith(newRoleData);
    });

    it('debe manejar errores en creación de rol', async () => {
      const mockError = new Error('Error de creación');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.crearRol.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const createdRole = await result.current.createRole({
          name: 'Test',
          permissions: []
        });
        expect(createdRole).toBeNull();
      });

      expect(result.current.error).toContain('Error al crear rol');
    });
  });

  describe('editRole', () => {
    it('debe editar rol exitosamente y actualizar la lista', async () => {
      const updateData: CreateRoleData = {
        name: 'SuperAdmin',
        description: 'Super Administrador',
        permissions: ['view_users', 'edit_users']
      };

      const updatedRole: Role = {
        ...mockRolesBackend[0],
        name: updateData.name,
        description: updateData.description
      };

      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.editarRol.mockResolvedValueOnce({
        data: updatedRole,
        message: 'Rol actualizado exitosamente'
      } as ApiResponse<Role>);

      const { result } = renderHook(() => useRoles());

      // Cargar roles iniciales
      await act(async () => {
        await result.current.loadRoles();
      });

      // Editar rol
      await act(async () => {
        const editedRole = await result.current.editRole(1, updateData);
        expect(editedRole).toEqual(updatedRole);
      });

      const updatedRoleInList = result.current.roles.find(r => r.id === 1);
      expect(updatedRoleInList?.name).toBe('SuperAdmin');
      expect(mockedRoleService.editarRol).toHaveBeenCalledWith(1, updateData);
    });

    it('debe manejar errores en edición de rol', async () => {
      const mockError = new Error('Error de actualización');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.editarRol.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const editedRole = await result.current.editRole(1, { name: 'Test', permissions: [] });
        expect(editedRole).toBeNull();
      });

      expect(result.current.error).toContain('Error al editar rol');
    });
  });

  describe('deleteRole', () => {
    it('debe eliminar rol exitosamente y removerlo de la lista', async () => {
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.eliminarRol.mockResolvedValueOnce({
        message: 'Rol eliminado exitosamente'
      } as any);

      const { result } = renderHook(() => useRoles());

      // Cargar roles iniciales
      await act(async () => {
        await result.current.loadRoles();
      });

      expect(result.current.roles).toHaveLength(2);

      // Eliminar rol
      await act(async () => {
        const success = await result.current.deleteRole(1);
        expect(success).toBe(true);
      });

      expect(result.current.roles).toHaveLength(1);
      expect(result.current.roles.find(r => r.id === 1)).toBeUndefined();
      expect(mockedRoleService.eliminarRol).toHaveBeenCalledWith(1);
    });

    it('debe manejar errores en eliminación de rol', async () => {
      const mockError = new Error('Error de eliminación');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.eliminarRol.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const success = await result.current.deleteRole(1);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Error al eliminar rol');
    });
  });

  describe('getRoleById', () => {
    it('debe obtener rol específico exitosamente', async () => {
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.obtenerRol.mockResolvedValueOnce({
        data: mockRolesBackend[0],
        message: 'Rol obtenido exitosamente'
      } as ApiResponse<Role>);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const role = await result.current.getRoleById(1);
        expect(role).toEqual(mockRolesBackend[0]);
      });

      expect(mockedRoleService.obtenerRol).toHaveBeenCalledWith(1);
    });

    it('debe manejar errores al obtener rol específico', async () => {
      const mockError = new Error('Rol no encontrado');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.obtenerRol.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const role = await result.current.getRoleById(999);
        expect(role).toBeNull();
      });

      expect(result.current.error).toContain('Error al obtener rol');
    });
  });

  describe('loadPermissions', () => {
    it('debe cargar permisos disponibles exitosamente', async () => {
      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const permissions = await result.current.loadPermissions();
        expect(permissions).toEqual(mockPermissions);
      });

      expect(result.current.availablePermissions).toEqual(mockPermissions);
      expect(roleService.listarPermisos).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores en carga de permisos', async () => {
      const mockError = new Error('Error obteniendo permisos');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.listarPermisos.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      await act(async () => {
        const permissions = await result.current.loadPermissions();
        expect(permissions).toBeNull();
      });

      expect(result.current.error).toContain('Error al cargar permisos');
    });
  });

  describe('clearError', () => {
    it('debe limpiar errores correctamente', async () => {
      const mockError = new Error('Test error');
      const mockedRoleService = jest.mocked(roleService);
      mockedRoleService.listarRoles.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRoles());

      // Generar un error
      await act(async () => {
        await result.current.loadRoles();
      });

      expect(result.current.error).toBeTruthy();

      // Limpiar error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('integración completa', () => {
    it('debe mantener consistencia después de operaciones CRUD', async () => {
      const mockedRoleService = jest.mocked(roleService);
      
      const { result } = renderHook(() => useRoles());

      // Carga inicial
      await act(async () => {
        await result.current.loadRoles();
      });

      expect(result.current.roles).toHaveLength(2);

      // Simular creación
      const newRole: Role = {
        id: 3,
        name: 'TestRole',
        permissions: []
      };

      mockedRoleService.crearRol.mockResolvedValueOnce({
        data: newRole,
        message: 'Creado'
      } as ApiResponse<Role>);

      await act(async () => {
        await result.current.createRole({ name: 'TestRole', permissions: [] });
      });

      expect(result.current.roles).toHaveLength(3);

      // Simular eliminación
      mockedRoleService.eliminarRol.mockResolvedValueOnce({
        message: 'Eliminado'
      } as any);

      await act(async () => {
        await result.current.deleteRole(3);
      });

      expect(result.current.roles).toHaveLength(2);
    });
  });
});