/**
 * RoleService - Servicio para operaciones relacionadas con roles
 * 
 * Funcionalidades:
 * - Crear nuevos roles con permisos
 * - Listar permisos disponibles del sistema
 * - Obtener lista completa de roles
 * - Manejo de errores unificado
 * - Integración completa con Laravel backend
 * 
 * Configuración:
 * - baseURL: Apunta al API de Laravel (puerto 8000)
 * - Headers: Content-Type y Accept application/json
 * - Patrón Singleton para una sola instancia global
 */

// Servicio para manejar operaciones relacionadas con roles
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
 * Servicio para gestión de roles - Patrón Singleton
 */
class RoleService {
  private baseURL: string;

  constructor() {
    // URL base del backend Laravel - Configuración para desarrollo
    this.baseURL = 'http://127.0.0.1:8000/api';
  }

  /**
   * Crear un nuevo rol
   */
  async crearRol(roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(`${this.baseURL}/roles/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando rol:', error);
      throw error;
    }
  }

  /**
   * Editar un rol existente
   */
  async editarRol(roleId: number, roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(`${this.baseURL}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error editando rol:', error);
      throw error;
    }
  }

  /**
   * Listar permisos disponibles
   */
  async listarPermisos(): Promise<ApiResponse<PermissionOption[]>> {
    try {
      const response = await fetch(`${this.baseURL}/roles/permisos`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // El backend ahora devuelve objetos con {id, name, label}
      // Necesitamos transformar a PermissionOption {value, label}
      if (data.data && Array.isArray(data.data)) {
        if (typeof data.data[0] === 'string') {
          // Fallback: el backend aún envía solo strings - transformar manualmente
          const transformedPermissions = data.data.map((name: string) => ({
            value: name,
            label: name // Sin transformación, usar el nombre técnico como etiqueta
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
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      throw error;
    }
  }

  /**
   * Eliminar un rol por ID
   */
  async eliminarRol(roleId: number): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${this.baseURL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando rol:', error);
      throw error;
    }
  }

  /**
   * Listar todos los roles
   */
  async listarRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await fetch(`${this.baseURL}/roles`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<BackendRole[]> = await response.json();
      
      // Transformar los roles del backend al formato del frontend
      if (data.data && Array.isArray(data.data)) {
        const transformedRoles = data.data.map(transformBackendRole);
        return {
          ...data,
          data: transformedRoles
        };
      }

      return data as unknown as ApiResponse<Role[]>;
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw error;
    }
  }

  /**
   * Obtener un rol específico por ID
   */
  async obtenerRol(roleId: number): Promise<ApiResponse<Role>> {
    try {
      const url = `${this.baseURL}/roles/${roleId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<BackendRole> = await response.json();
      
      // Transformar el rol del backend al formato del frontend
      if (data.data) {
        const transformedRole = transformBackendRole(data.data);
        return {
          ...data,
          data: transformedRole
        };
      }

      return data as unknown as ApiResponse<Role>;
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio - Un solo punto de acceso global
export const roleService = new RoleService();