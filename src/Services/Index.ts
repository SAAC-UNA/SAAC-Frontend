// ===== SERVICIOS =====
// Exportación centralizada de todos los servicios de la aplicación

// Autenticación
export { authService } from './AuthService';

// Gestión de Usuarios
export { userService } from './UserService';
export type { BackendUser, BackendRole, BackendPermission, User } from './UserService';

// Gestión de Roles y Permisos
export { roleService } from './RoleService';
export type { CreateRoleData, Role, ApiResponse } from './RoleService';

// Gestión de Archivos
export { fileService } from './FileService';

// Gestión de Estructura
export { structureService } from './StructureService';

// Gestión de Acreditación
export { getProcesses, getAccreditationCycles } from './AccreditationService';
export type { 
  Career, 
  Campus, 
  CareerCampus, 
  AccreditationCycle,
  Process
} from './AccreditationService';

// Bitácora del Sistema (HU-005)
export { default as auditLogService } from './AuditLogService';
export type { 
  AuditLog, 
  AuditLogFilters, 
  AuditLogPaginatedResponse, 
  ActionType,
  ExportFormat 
} from '../Types/AuditLogTypes';

// Gestión de Asignaciones de Evidencias (HU-029)
export { evidenceAssignmentService } from './EvidenceAssignmentService';
export type {
  EvidenceAssignment,
  UpdateAssignmentParams
} from '../Types/EvidenceAssignmentTypes';
export type {
  EvidenceAssignmentRequest,
  EvidenceAssignmentApiResponse,
  Evidence,
  Criterion,
  Process as EvidenceProcess,
  DuplicateValidationRequest,
  DuplicateValidationResponse
} from '../Types/EvidenceAssignment';

// Solicitudes de Ampliación (HU-016)
export { extensionRequestService } from './ExtensionRequestService';
export type {
  ExtensionRequest,
  ExtensionRequestStatus,
  CreateExtensionRequestData,
  ReviewExtensionRequestData,
  ExtensionRequestPaginatedResponse
} from '../Types/ExtensionRequestTypes';