/**
 * Pages/Users - Exportaciones centralizadas del módulo de usuarios
 *
 * Estructura consolidada siguiendo el patrón de Roles:
 * - UsersRepository: Página principal con lista de usuarios
 * - Components: Sub-componentes específicos del módulo
 */

// Páginas principales
export { default as UsersRepository } from './UsersList';
export { default as EditUserPage } from './EditUser';

// Componentes del módulo
export { UsersTable } from './Components/UsersTable';
export { UserDetailsModal } from './Components/UserDetailsModal';
export { EditUserForm } from './Components/EditUserForm';

// Re-exportar tipos
export type { User } from '@/Services/UserService';