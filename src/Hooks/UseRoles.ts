import { useState, useCallback } from 'react';
import { roleService } from '@/Services/RoleService';
import type { CreateRoleData, Role, ApiResponse } from '@/Services/RoleService';
import type { PermissionGroupOption, PermissionOption } from '@/types/RoleTypes';

/**
 * Extracts the most user-readable error message from an unknown error.
 * Prioritises backend `response.data.message` (Axios) over generic message.
 */
function extractBackendError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>;
      if (resp.data && typeof resp.data === 'object') {
        const data = resp.data as Record<string, unknown>;
        if (typeof data.message === 'string' && data.message) return data.message;
      }
    }
  }
  return fallback;
}

/**
 * HOOK DE GESTIÓN DE ROLES
 * 
 * Hook centralizado para todas las operaciones CRUD de roles y permisos.
 * Maneja estado local, llamadas a API, manejo de errores y actualizaciones
 * optimistas para una experiencia de usuario fluida.
 * 
 * OPERACIONES:
 * - CRUD completo de roles (crear, leer, actualizar, eliminar)
 * - Gestión de permisos disponibles
 * - Manejo de estados de carga y errores
 * - Actualizaciones optimistas del estado local
 */

interface UseRolesReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  roles: Role[];
  availablePermissions: PermissionOption[];
  availablePermissionGroups: PermissionGroupOption[];
  
  // Acciones
  createRole: (roleData: CreateRoleData) => Promise<Role | null>;
  editRole: (roleId: number, roleData: CreateRoleData) => Promise<Role | null>;
  deleteRole: (roleId: number) => Promise<boolean>;
  toggleRoleStatus: (roleId: number) => Promise<boolean>;
  getRoleById: (roleId: number) => Promise<Role | null>;
  loadPermissions: () => Promise<PermissionOption[] | null>;
  loadRoles: () => Promise<Role[] | null>;
  clearError: () => void;
}

export const useRoles = (): UseRolesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState<PermissionGroupOption[]>([]);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Crear un nuevo rol
   */
  const createRole = useCallback(async (roleData: CreateRoleData): Promise<Role | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.crearRol(roleData);
      
      if (response.data) {
        // Agregar el nuevo rol a la lista local (optimistic update)
        setRoles(prevRoles => [...prevRoles, response.data!]);
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const msg = extractBackendError(err, 'Error al crear rol');
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Editar un rol existente
   */
  const editRole = useCallback(async (roleId: number, roleData: CreateRoleData): Promise<Role | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.editarRol(roleId, roleData);
      
      if (response.data) {
        // Actualizar el rol en la lista local (optimistic update)
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === roleId ? response.data! : role
          )
        );
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const msg = extractBackendError(err, 'Error al editar rol');
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar un rol
   */
  const deleteRole = useCallback(async (roleId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await roleService.eliminarRol(roleId);
      
      // Remover el rol de la lista local (optimistic update)
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      return true;
    } catch (err) {
      const msg = extractBackendError(err, 'Error al eliminar rol');
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener un rol específico por ID
   * NO modifica el estado global de loading para no interferir con otros componentes
   */
  const getRoleById = useCallback(async (roleId: number): Promise<Role | null> => {
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.obtenerRol(roleId);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener rol: ${errorMessage}`);
      return null;
    }
  }, [setError]); // Solo depende de setError

  /**
   * Cargar permisos disponibles
   */
  const loadPermissions = useCallback(async (): Promise<PermissionOption[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<PermissionOption[]> = await roleService.listarPermisos();
      
      if (response.data) {
        setAvailablePermissions(response.data);
        const groupedPermissions = (response as ApiResponse<PermissionOption[]> & { groups?: PermissionGroupOption[] }).groups ?? [];
        setAvailablePermissionGroups(groupedPermissions);
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar permisos: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Alternar el estado activo/inactivo de un rol
   */
  const toggleRoleStatus = useCallback(async (roleId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await roleService.toggleRoleStatus(roleId);
      const isActive = (response as any).is_active ?? response.data?.is_active;

      // Actualizar optimistamente el estado en la lista local
      setRoles(prevRoles =>
        prevRoles.map(role =>
          role.id === roleId ? { ...role, is_active: isActive } : role
        )
      );
      return true;
    } catch (err) {
      const msg = extractBackendError(err, 'Error al cambiar estado del rol');
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar lista de roles
   */
  const loadRoles = useCallback(async (): Promise<Role[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role[]> = await roleService.listarRoles();
      
      if (response.data) {
        setRoles(response.data);
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar roles: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []); // No tiene dependencias

  return {
    // Estados
    isLoading,
    error,
    roles,
    availablePermissions,
    availablePermissionGroups,
    
    // Acciones
    createRole,
    editRole,
    deleteRole,
    toggleRoleStatus,
    getRoleById,
    loadPermissions,
    loadRoles,
    clearError,
  };
};