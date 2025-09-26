import { useState } from 'react';
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
    loadPermissions,
    loadRoles,
    clearError,
  };
};