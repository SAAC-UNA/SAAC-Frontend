/**
 * Tipos relacionados con roles y privilegios
 */

export interface RoleFormData {
  name: string;
  description: string;
  privileges: string[];
}

export interface Role extends RoleFormData {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface Privilege {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

/**
 * Estructura de permisos que devuelve el backend
 */
export interface PermissionOption {
  value: string;  // nombre técnico (ej: "gestion_roles")
  label: string;  // descripción legible (ej: "Gestión de Roles")
}