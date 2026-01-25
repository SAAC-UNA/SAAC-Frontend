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

// Progreso de Acreditación
export { default as AccreditationProgress } from './Accreditation/AccreditationProgress';

// Asignación de Evidencias (HU-029)
export { EvidenceAssignment } from './EvidenceAssignment';
export { default as MyEvidenceAssignmentsPage } from './EvidenceAssignment/MyEvidenceAssignmentsPage';

// Subida de Evidencias
export { EvidenceUploadPage } from './Evidence';

// Bitácora del Sistema (HU-005)
export { AuditLogPage } from './AuditLog';

// Solicitudes de Ampliación (HU-016)
export { ManageExtensionRequestsPage, MyExtensionRequestsPage } from './ExtensionRequest';
