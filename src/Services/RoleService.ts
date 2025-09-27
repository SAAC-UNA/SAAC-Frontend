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
import type { PermissionOption } from '../Types/RoleTypes';
import { transformPermissionsToOptions } from '../Utils/PermissionLabels';

/**
 * Datos requeridos para crear un nuevo rol
 */
export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Estructura de un rol del sistema
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Estructura estándar de respuesta de la API Laravel
 */
export interface ApiResponse<T = any> {
  mensaje?: string;
  mensajeError?: string;
  datos?: T;
}

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

      const data = await response.json();
      
      // El backend devuelve un array de strings con nombres técnicos
      // Los transforma a PermissionOption con etiquetas legibles
      if (data.datos && Array.isArray(data.datos)) {
        const transformedPermissions = transformPermissionsToOptions(data.datos);
        return {
          ...data,
          datos: transformedPermissions
        };
      }

      return data;
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

// Instancia singleton del servicio - Un solo punto de acceso global
export const roleService = new RoleService();