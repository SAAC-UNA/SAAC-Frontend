// Servicio para manejar operaciones relacionadas con roles
import type { PermissionOption } from '../Types/RoleTypes';

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

export interface ApiResponse<T = any> {
  mensaje?: string;
  mensajeError?: string;
  datos?: T;
}

class RoleService {
  private baseURL: string;

  constructor() {
    // URL base del backend - ajustar según tu configuración
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
        throw new Error(errorData.mensajeError || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando rol:', error);
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
        throw new Error(errorData.mensajeError || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
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
        throw new Error(errorData.mensajeError || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const roleService = new RoleService();