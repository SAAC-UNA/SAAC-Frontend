/**
 * Pages/Roles - Exportaciones centralizadas del módulo de roles
 * 
 * Estructura consolidada siguiendo el patrón de Structure:
 * - RolesRepository: Página principal con lista de roles
 * - RolesCreation: Página para crear nuevos roles
 * - RolesEdit: Página para editar roles existentes
 * - Components: Sub-componentes específicos del módulo
 */

// Páginas principales
export { default as RolesRepository } from './RolesList';
export { default as RolesCreation } from './RolesCreation';
export { default as RolesEdit } from './RolesEdit';

// Componentes del módulo
export { RolesTable } from './Components/RolesTable';
export { CreateRoleForm } from './Components/CreateRoleForm';
export { TableIcons } from './Components/TableIcons';

// Re-exportar tipos si es necesario
export type { CreateRoleData } from '@/Services/RoleService';