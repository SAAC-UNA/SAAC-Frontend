/**
 * UserService - Servicio simplificado para gestión básica de usuarios
 * 
 * Solo maneja las operaciones esenciales:
 * - Listar usuarios
 * - Activar/Desactivar usuarios
 * - Obtener detalles de un usuario (para el modal del ojo)
 * - Asignar roles (para el modal del lápiz)
 */

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
}

/**
 * Estructura de un usuario del sistema (como lo devuelve el backend)
 */
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  cedula: string;
  created_at: string;
  updated_at: string;
  roles: BackendRole[];
  direct_permissions: BackendPermission[];
  all_permissions: BackendPermission[];
}

/**
 * Estructura de un usuario del sistema (para el frontend)
 */
export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role?: string;
  directPermissions?: string[];
  allPermissions?: BackendPermission[]; // Ahora incluye las etiquetas del backend
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  message?: string;
  errorMessage?: string;
  data?: T;
}

/**
 * Servicio para gestión básica de usuarios
 */
class UserService {
  private baseURL = 'http://127.0.0.1:8000/api/admin/users';

  /**
   * Listar todos los usuarios
   */
  async listUsers(): Promise<BackendUser[]> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // El backend devuelve los usuarios directamente en un array (UserResource::collection)
      return Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Activar un usuario
   */
  async activateUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseURL}/${userId}/activate`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error activando usuario:', error);
      throw error;
    }
  }

  /**
   * Desactivar un usuario
   */
  async deactivateUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseURL}/${userId}/deactivate`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      throw error;
    }
  }

  /**
   * Asignar rol a un usuario (para el modal del lápiz)
   */
  async assignUserRole(userId: number, roleName: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ role: roleName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error asignando rol:', error);
      throw error;
    }
  }
}

export const userService = new UserService();