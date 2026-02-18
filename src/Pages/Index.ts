// ===== PÁGINAS =====
// Exportación centralizada de todas las páginas de la aplicación

// Página principal
export { default as HomePage } from './HomePage';

// Autenticación
export { Login } from './Auth/Login';

// Gestión de Roles
export { RolesRepository, RoleForm } from './Roles';

// Gestión de Usuarios
export { UsersRepository, EditUserPage } from './Users';

// Gestión de Estructura
export { default as StructureRepository } from './Structure/StructureList';
export { default as StructureCreation } from './Structure/StructureCreation';
export { default as StructureEditForm } from './Structure/StructureEditForm';
export { default as StructureEditList } from './Structure/StructureEditList';

// Asignación de Evidencias
export { EvidenceAssignment } from './EvidenceAssignment';

// Mis Evidencias
export { MyEvidenceAssignmentsPage } from './MyEvidence';

// Subida de Evidencias
export { EvidenceUploadPage } from './EvidenceUpload';

// Bitácora del Sistema
export { AuditLogPage } from './AuditLog';

// Solicitudes de Ampliación
export { ManageExtensionRequestsPage, MyExtensionRequestsPage } from './ExtensionRequest';
