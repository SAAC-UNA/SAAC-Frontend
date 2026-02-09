/**
 * RoleService - Servicio para operaciones relacionadas con roles
 * 
 * Funcionalidades:
 * - Crear nuevos roles con permisos
 * - Listar permisos disponibles del sistema
 * - Obtener lista completa de roles
 * - Manejo de errores unificado
 * - Integración completa con Laravel backend
 */

import { axiosInstance } from '@/Config/axios';
import type { PermissionOption } from '@/types/RoleTypes';

/**
 * Datos requeridos para crear un nuevo rol
 */
export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Estructura de un permiso como lo devuelve el backend
 */
export interface BackendPermission {
  id: number;
  name: string;
  label: string;
}

/**
 * Estructura de un rol como lo devuelve el backend
 */
export interface BackendRole {
  id: number;
  name: string;
  description?: string;
  permissions: BackendPermission[];
  // created_at?: string; // TODO: Uncomment when backend adds this field to RoleResource
  // updated_at?: string; // TODO: Uncomment when backend adds this field to RoleResource
}

/**
 * Estructura de un rol del sistema (para el frontend)
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: BackendPermission[]; // Ahora usa las etiquetas del backend
  // createdAt?: Date; // TODO
  // updatedAt?: Date; // TODO
}

/**
 * Estructura estándar de respuesta de la API Laravel
 */
export interface ApiResponse<T = any> {
  message?: string;
  errorMessage?: string;
  data?: T;
}

/**
 * Transforma un rol del backend al formato del frontend
 */
const transformBackendRole = (backendRole: BackendRole): Role => {
  return {
    id: backendRole.id,
    name: backendRole.name,
    description: backendRole.description,
    permissions: backendRole.permissions, // Ahora mantenemos los objetos completos
    // createdAt: backendRole.created_at ? new Date(backendRole.created_at) : undefined, // TODO
    // updatedAt: backendRole.updated_at ? new Date(backendRole.updated_at) : undefined  // TODO
  };
};

/**
 * Servicio para gestión de roles
 */
class RoleService {
  /**
   * Crear un nuevo rol
   */
  async crearRol(roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    try {
      const response = await axiosInstance.post('/roles', roleData);
      return response.data;
    } catch (error: any) {
      console.error('Error creando rol:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al crear el rol');
    }
  }

  /**
   * Editar un rol existente
   */
  async editarRol(roleId: number, roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    try {
      const response = await axiosInstance.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error: any) {
      console.error('Error editando rol:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al editar el rol');
    }
  }

  /**
   * Listar permisos disponibles
   */
  async listarPermisos(): Promise<ApiResponse<PermissionOption[]>> {
    try {
      const response = await axiosInstance.get('/roles/permisos');
      const data = response.data;
      
      // El backend ahora devuelve objetos con {id, name, label}
      // Necesitamos transformar a PermissionOption {value, label}
      if (data.data && Array.isArray(data.data)) {
        if (typeof data.data[0] === 'string') {
          // Fallback: el backend aún envía solo strings - transformar manualmente
          const transformedPermissions = data.data.map((name: string) => ({
            value: name,
            label: name
          }));
          return {
            ...data,
            data: transformedPermissions
          };
        } else if (data.data[0] && typeof data.data[0] === 'object' && 'name' in data.data[0]) {
          // El backend envía objetos con {id, name, label}
          const transformedPermissions = data.data.map((permission: any) => ({
            value: permission.name,
            label: permission.label
          }));
          return {
            ...data,
            data: transformedPermissions
          };
        }
      }

      return data;
    } catch (error: any) {
      console.error('Error obteniendo permisos:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al obtener permisos');
    }
  }

  /**
   * Eliminar un rol por ID
   */
  async eliminarRol(roleId: number): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error eliminando rol:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al eliminar el rol');
    }
  }

  /**
   * Listar todos los roles
   */
  async listarRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await axiosInstance.get('/roles');
      const data: ApiResponse<BackendRole[]> = response.data;
      
      // Transformar los roles del backend al formato del frontend
      if (data.data && Array.isArray(data.data)) {
        const transformedRoles = data.data.map(transformBackendRole);
        return {
          ...data,
          data: transformedRoles
        };
      }

      return data as unknown as ApiResponse<Role[]>;
    } catch (error: any) {
      console.error('Error obteniendo roles:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al obtener roles');
    }
  }

  /**
   * Obtener un rol específico por ID
   */
  async obtenerRol(roleId: number): Promise<ApiResponse<Role>> {
    try {
      const response = await axiosInstance.get(`/roles/${roleId}`);
      const data: ApiResponse<BackendRole> = response.data;
      
      // Transformar el rol del backend al formato del frontend
      if (data.data) {
        const transformedRole = transformBackendRole(data.data);
        return {
          ...data,
          data: transformedRole
        };
      }

      return data as unknown as ApiResponse<Role>;
    } catch (error: any) {
      console.error('Error obteniendo rol:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al obtener el rol');
    }
  }
}

// Instancia singleton del servicio - Un solo punto de acceso global
export const roleService = new RoleService();