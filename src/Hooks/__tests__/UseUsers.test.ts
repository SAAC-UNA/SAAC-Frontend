/**
 * Tests para useUsers hook
 * 
 * Valida la funcionalidad crítica de gestión de usuarios incluyendo:
 * - Actualización optimista en activar/desactivar
 * - Reversión automática en caso de error
 * - Transformación correcta de datos del backend
 * - Manejo de estados de loading y error
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers } from '../UseUsers';
import { userService } from '../../Services/UserService';
import type { BackendUser } from '../../Services/UserService';

// Mock del UserService
jest.mock('@/Services/UserService', () => ({
  userService: {
    listUsers: jest.fn(),
    activateUser: jest.fn(),
    deactivateUser: jest.fn(),
  },
}));

const mockUserService = userService as jest.Mocked<typeof userService>;

// Datos mock para testing
const mockBackendUsers: BackendUser[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    status: 'active',
    cedula: '123456789',
    roles: [{ id: 1, name: 'Admin' }],
    direct_permissions: [{ id: 1, name: 'users.create', label: 'Crear Usuarios' }],
    all_permissions: [
      { id: 1, name: 'users.create', label: 'Crear Usuarios' },
      { id: 2, name: 'users.read', label: 'Ver Usuarios' }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'María González',
    email: 'maria@test.com',
    status: 'inactive',
    cedula: '987654321',
    roles: [{ id: 2, name: 'User' }],
    direct_permissions: [],
    all_permissions: [{ id: 2, name: 'users.read', label: 'Ver Usuarios' }],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const mockApiResponse = {
  data: {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    status: 'active' as const,
    role: 'Admin',
    directPermissions: ['users.create'],
    allPermissions: [
      { id: 1, name: 'users.create', label: 'Crear Usuarios' },
      { id: 2, name: 'users.read', label: 'Ver Usuarios' }
    ],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  message: 'Usuario actualizado exitosamente',
};

describe('useUsers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup console.log y console.error como mocks para evitar spam en tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadUsers', () => {
    it('debe cargar usuarios exitosamente y transformar datos del backend', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);

      const { result } = renderHook(() => useUsers());

      // Estado inicial
      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);

      // Ejecutar loadUsers
      await act(async () => {
        await result.current.loadUsers();
      });

      // Verificar que se llamó al servicio
      expect(mockUserService.listUsers).toHaveBeenCalledTimes(1);

      // Verificar transformación correcta de datos
      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[0]).toEqual({
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@test.com',
        status: 'active',
        role: 'Admin',
        careers: [],
        directPermissions: ['users.create'],
        allPermissions: [
          { id: 1, name: 'users.create', label: 'Crear Usuarios' },
          { id: 2, name: 'users.read', label: 'Ver Usuarios' }
        ],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('debe manejar errores en loadUsers correctamente', async () => {
      const errorMessage = 'Error de conexión';
      mockUserService.listUsers.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadUsers();
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('debe mostrar estado de loading durante carga', async () => {
      let resolvePromise: (value: BackendUser[]) => void;
      const loadPromise = new Promise<BackendUser[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockUserService.listUsers.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useUsers());

      // Iniciar carga
      act(() => {
        result.current.loadUsers();
      });

      // Verificar estado de loading
      expect(result.current.isLoading).toBe(true);

      // Completar carga
      await act(async () => {
        resolvePromise!(mockBackendUsers);
        await loadPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('activarUsuario', () => {
    it('debe hacer actualización optimista y mantener cambio en éxito', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      mockUserService.activateUser.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios inicial
      await act(async () => {
        await result.current.loadUsers();
      });

      // Verificar estado inicial
      expect(result.current.users[1].status).toBe('inactive');

      // Activar usuario
      await act(async () => {
        await result.current.activarUsuario(2);
      });

      // Verificar actualización optimista se mantuvo
      expect(result.current.users[1].status).toBe('active');
      expect(mockUserService.activateUser).toHaveBeenCalledWith(2);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe revertir actualización optimista en caso de error', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      mockUserService.activateUser.mockRejectedValue(new Error('Error 409: Conflict'));

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios inicial
      await act(async () => {
        await result.current.loadUsers();
      });

      // Estado inicial: usuario inactivo
      expect(result.current.users[1].status).toBe('inactive');

      // Intentar activar usuario (fallará)
      let thrownError;
      await act(async () => {
        try {
          await result.current.activarUsuario(2);
        } catch (error) {
          thrownError = error;
        }
      });

      // Verificar que se revirtió el cambio optimista
      expect(result.current.users[1].status).toBe('inactive');
      expect(thrownError).toBeDefined();
      expect(result.current.error).toContain('Error');
      expect(result.current.isLoading).toBe(false);
    });

    it('debe mostrar estado de loading durante operación', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      
      let resolveActivate: (value: any) => void;
      const activatePromise = new Promise<any>((resolve) => {
        resolveActivate = resolve;
      });
      mockUserService.activateUser.mockReturnValue(activatePromise);

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios inicial
      await act(async () => {
        await result.current.loadUsers();
      });

      // Iniciar activación
      act(() => {
        result.current.activarUsuario(2);
      });

      // Verificar loading state
      expect(result.current.isLoading).toBe(true);

      // Completar operación
      await act(async () => {
        resolveActivate!(mockApiResponse);
        await activatePromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('desactivarUsuario', () => {
    it('debe hacer actualización optimista y mantener cambio en éxito', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      mockUserService.deactivateUser.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios inicial
      await act(async () => {
        await result.current.loadUsers();
      });

      // Verificar estado inicial
      expect(result.current.users[0].status).toBe('active');

      // Desactivar usuario
      await act(async () => {
        await result.current.desactivarUsuario(1);
      });

      // Verificar actualización optimista se mantuvo
      expect(result.current.users[0].status).toBe('inactive');
      expect(mockUserService.deactivateUser).toHaveBeenCalledWith(1);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe revertir actualización optimista en caso de error', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      mockUserService.deactivateUser.mockRejectedValue(new Error('Error 500: Server Error'));

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios inicial
      await act(async () => {
        await result.current.loadUsers();
      });

      // Estado inicial: usuario activo
      expect(result.current.users[0].status).toBe('active');

      // Intentar desactivar usuario (fallará)
      let thrownError;
      await act(async () => {
        try {
          await result.current.desactivarUsuario(1);
        } catch (error) {
          thrownError = error;
        }
      });

      // Verificar que se revirtió el cambio optimista
      expect(result.current.users[0].status).toBe('active');
      expect(thrownError).toBeDefined();
      expect(result.current.error).toContain('Error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('transformación de datos', () => {
    it('debe manejar usuarios sin roles correctamente', async () => {
      const userWithoutRoles: BackendUser = {
        ...mockBackendUsers[0],
        roles: [],
      };

      mockUserService.listUsers.mockResolvedValue([userWithoutRoles]);

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadUsers();
      });

      expect(result.current.users[0].role).toBeUndefined();
    });

    it('debe manejar usuarios sin permisos directos correctamente', async () => {
      const userWithoutDirectPermissions: BackendUser = {
        ...mockBackendUsers[0],
        direct_permissions: [],
      };

      mockUserService.listUsers.mockResolvedValue([userWithoutDirectPermissions]);

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadUsers();
      });

      expect(result.current.users[0].directPermissions).toEqual([]);
    });

    it('debe transformar fechas correctamente', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadUsers();
      });

      expect(result.current.users[0].createdAt).toBeInstanceOf(Date);
      expect(result.current.users[0].updatedAt).toBeInstanceOf(Date);
      expect(result.current.users[0].createdAt.getFullYear()).toBeGreaterThanOrEqual(2023);
    });
  });

  describe('integración completa', () => {
    it('debe mantener consistencia después de múltiples operaciones', async () => {
      mockUserService.listUsers.mockResolvedValue(mockBackendUsers);
      mockUserService.activateUser.mockResolvedValue(mockApiResponse);
      mockUserService.deactivateUser.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUsers());

      // Cargar usuarios
      await act(async () => {
        await result.current.loadUsers();
      });

      // Activar usuario 2
      await act(async () => {
        await result.current.activarUsuario(2);
      });

      expect(result.current.users[1].status).toBe('active');

      // Desactivar usuario 1
      await act(async () => {
        await result.current.desactivarUsuario(1);
      });

      expect(result.current.users[0].status).toBe('inactive');

      // Verificar que los demás usuarios no se afectaron
      expect(result.current.users[1].status).toBe('active');
      expect(result.current.users).toHaveLength(2);
    });
  });
});
