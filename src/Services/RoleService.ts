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
import type {
  PermissionCatalog,
  PermissionGroupOption,
  PermissionOption,
} from '@/types/RoleTypes';

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
  users_count: number;
  is_protected: boolean;
  can_delete: boolean;
  is_active: boolean;
}

/**
 * Estructura de un rol del sistema (para el frontend)
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: BackendPermission[];
  users_count: number;
  is_protected: boolean;
  can_delete: boolean;
  is_active: boolean;
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
    permissions: backendRole.permissions,
    users_count: backendRole.users_count ?? 0,
    is_protected: backendRole.is_protected ?? false,
    can_delete: backendRole.can_delete ?? false,
    is_active: backendRole.is_active ?? true,
  };
};

interface RawPermissionGroup {
  group?: string;
  module?: string;
  name?: string;
  label?: string;
  description?: string | null;
  permissions?: Array<{ name?: string; value?: string; label?: string }>;
}

interface PermissionGroupBucket {
  key: string;
  label: string;
  description: string;
  modules: string[];
}

const PERMISSION_GROUP_BUCKETS: PermissionGroupBucket[] = [
  {
    key: 'estructura_universitaria',
    label: 'Estructura universitaria',
    description: 'Universidades, sedes y carreras.',
    modules: ['universidades', 'campuses', 'carreras'],
  },
  {
    key: 'estructura_acreditacion',
    label: 'Estructura de acreditación',
    description: 'Dimensiones, componentes, criterios, estándares y elementos.',
    modules: ['dimensiones', 'componentes', 'criterios', 'estandares', 'elemento'],
  },
];

const getBucketForModule = (moduleName: string): PermissionGroupBucket | null => {
  return PERMISSION_GROUP_BUCKETS.find((bucket) => bucket.modules.includes(moduleName)) ?? null;
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
  async listarPermisos(): Promise<ApiResponse<PermissionOption[]> & { groups?: PermissionGroupOption[] }> {
    try {
      const response = await axiosInstance.get('/roles/modules');
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        const catalog = this.transformPermissionCatalog(data.data);
        return {
          ...data,
          data: catalog.permissions,
          groups: catalog.groups,
        };
      }

      return data;
    } catch (error: any) {
      console.error('Error obteniendo permisos:', error);
      throw new Error(error.response?.data?.errorMessage || error.message || 'Error al obtener permisos');
    }
  }

  private transformPermissionCatalog(rawGroups: RawPermissionGroup[]): PermissionCatalog {
    const groupedBuckets = new Map<string, PermissionGroupOption>();
    const fallbackGroups: PermissionGroupOption[] = [];

    rawGroups.forEach((group) => {
      const moduleName = String(group.group ?? group.module ?? group.name ?? '').trim();
      const bucket = getBucketForModule(moduleName);
      const permissions = Array.isArray(group.permissions)
        ? group.permissions.map((permission: any) => ({
            value: String(permission.name ?? permission.value ?? ''),
            label: String(permission.label ?? permission.name ?? permission.value ?? ''),
          })).filter((permission) => permission.value !== '')
        : [];

      if (bucket) {
        const current = groupedBuckets.get(bucket.key);
        const nextPermissions = current ? [...current.permissions, ...permissions] : permissions;

        groupedBuckets.set(bucket.key, {
          key: bucket.key,
          label: bucket.label,
          description: bucket.description,
          permissions: nextPermissions,
        });
        return;
      }

      fallbackGroups.push({
        key: moduleName,
        label: moduleName === 'campuses'
          ? 'campuses'
          : String(group.name ?? group.label ?? group.module ?? group.group ?? ''),
        description: typeof group.description === 'string' ? group.description : undefined,
        permissions,
      });
    });

    const groups = [
      ...PERMISSION_GROUP_BUCKETS
        .map((bucket) => groupedBuckets.get(bucket.key))
        .filter((group): group is PermissionGroupOption => Boolean(group && group.permissions.length > 0)),
      ...fallbackGroups,
    ];

    return {
      groups,
      permissions: groups.flatMap((group) => group.permissions),
    };
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
   * Alternar el estado activo/inactivo de un rol
   */
  async toggleRoleStatus(roleId: number): Promise<ApiResponse<{ is_active: boolean }>> {
    try {
      const response = await axiosInstance.patch(`/roles/${roleId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error('Error cambiando estado del rol:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al cambiar el estado del rol');
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