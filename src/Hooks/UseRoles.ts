import { useState, useCallback } from 'react';
import { roleService } from '../Services/RoleService';
import type { CreateRoleData, Role, ApiResponse } from '../Services/RoleService';
import type { PermissionOption } from '../Types/RoleTypes';

interface UseRolesReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  roles: Role[];
  availablePermissions: PermissionOption[];
  
  // Acciones
  createRole: (roleData: CreateRoleData) => Promise<Role | null>;
  editRole: (roleId: number, roleData: CreateRoleData) => Promise<Role | null>;
  deleteRole: (roleId: number) => Promise<boolean>;
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

  /**
   * Limpiar errores
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Crear un nuevo rol
   */
  const createRole = async (roleData: CreateRoleData): Promise<Role | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.crearRol(roleData);
      
      if (response.datos) {
        // Agregar el nuevo rol a la lista local (optimistic update)
        setRoles(prevRoles => [...prevRoles, response.datos!]);
        return response.datos;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al crear rol: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Editar un rol existente
   */
  const editRole = async (roleId: number, roleData: CreateRoleData): Promise<Role | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.editarRol(roleId, roleData);
      
      if (response.datos) {
        // Actualizar el rol en la lista local (optimistic update)
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === roleId ? response.datos! : role
          )
        );
        return response.datos;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al editar rol: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Eliminar un rol
   */
  const deleteRole = async (roleId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await roleService.eliminarRol(roleId);
      
      // Remover el rol de la lista local (optimistic update)
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar rol: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtener un rol específico por ID
   * NO modifica el estado global de loading para no interferir con otros componentes
   */
  const getRoleById = useCallback(async (roleId: number): Promise<Role | null> => {
    setError(null);

    try {
      const response: ApiResponse<Role> = await roleService.obtenerRol(roleId);
      
      if (response.datos) {
        return response.datos;
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
  const loadPermissions = async (): Promise<PermissionOption[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<PermissionOption[]> = await roleService.listarPermisos();
      
      if (response.datos) {
        setAvailablePermissions(response.datos);
        return response.datos;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar permisos: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar lista de roles
   */
  const loadRoles = async (): Promise<Role[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Role[]> = await roleService.listarRoles();
      
      if (response.datos) {
        setRoles(response.datos);
        return response.datos;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar roles: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    isLoading,
    error,
    roles,
    availablePermissions,
    
    // Acciones
    createRole,
    editRole,
    deleteRole,
    getRoleById,
    loadPermissions,
    loadRoles,
    clearError,
  };
};