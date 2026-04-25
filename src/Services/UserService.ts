/**
 * UserService - Servicio simplificado para gestión básica de usuarios
 *
 * Solo maneja las operaciones esenciales:
 * - Listar usuarios
 * - Activar/Desactivar usuarios
 * - Obtener detalles de un usuario (para el modal del ojo)
 * - Asignar roles (para el modal del lápiz)
 */

import { axiosInstance } from "@/Config/axios";

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
 * Carrera-sede asignada a un usuario (como lo devuelve el backend)
 */
export interface BackendCareer {
  carrera_sede_id: number;
  carrera_id: number;
  nombre: string | null;
}

/**
 * Estructura de un usuario del sistema (como lo devuelve el backend)
 */
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  cedula: string;
  created_at: string;
  updated_at: string;
  roles: BackendRole[];
  careers: BackendCareer[];
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
  status: "active" | "inactive";
  role?: string;
  careers?: BackendCareer[];
  directPermissions?: string[];
  allPermissions?: BackendPermission[];
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
  /**
   * Listar todos los usuarios
   */
  async listUsers(): Promise<BackendUser[]> {
    try {
      const response = await axiosInstance.get("/admin/users");
      // El backend devuelve los usuarios directamente en un array (UserResource::collection)
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  }

  /**
   * Activar un usuario
   */
  async activateUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.patch(
        `/admin/users/${userId}/activate`,
      );
      return response.data;
    } catch (error) {
      console.error("Error activando usuario:", error);
      throw error;
    }
  }

  /**
   * Desactivar un usuario
   */
  async deactivateUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.patch(
        `/admin/users/${userId}/deactivate`,
      );
      return response.data;
    } catch (error) {
      console.error("Error desactivando usuario:", error);
      throw error;
    }
  }

  /**
   * Asignar rol a un usuario (para el modal del lápiz)
   */
  async assignUserRole(userId: number, roleName: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/role`, {
        role: roleName,
      });
      return response.data;
    } catch (error) {
      console.error("Error asignando rol:", error);
      throw error;
    }
  }

  /**
   * Asignar carrera-sedes a un usuario
   */
  async assignCareers(
    userId: number,
    careerSedeIds: number[],
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.put(
        `/admin/users/${userId}/careers`,
        {
          careers: careerSedeIds,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error asignando carreras:", error);
      throw error;
    }
  }

  /**
   * Listar carrera-sedes disponibles para el actor autenticado
   */
  async listCareerCampuses(): Promise<
    { carrera_sede_id: number; carrera_nombre: string; sede_nombre: string }[]
  > {
    try {
      const response = await axiosInstance.get("/estructura/carrera-sede");
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (error) {
      console.error("Error cargando carrera-sedes:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
