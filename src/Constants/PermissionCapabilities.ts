/**
 * Capacidades funcionales expresadas como permisos equivalentes.
 * Permite tolerar diferencias historicas de naming entre modulos.
 */
export const ROLE_MANAGEMENT_PERMISSIONS = [
  "roles.create",
  "roles.edit",
  "roles.delete",
];

export const USER_MANAGEMENT_PERMISSIONS = [
  "usuarios.create",
  "usuarios.edit",
  "usuarios.delete",
];

export const EVIDENCE_ASSIGNMENT_PERMISSIONS = [
  "evidencias.assign",
  "asignaciones.create",
  "asignaciones.edit",
];

export const EVIDENCE_VIEW_PERMISSIONS = [
  "evidencias.view",
  "asignaciones.view",
];

export const IMPROVEMENT_COMMITMENT_ACCESS_PERMISSIONS = [
  "compromisos_mejora.view",
  "compromisos_mejora.create",
  "compromisos_mejora.edit",
];

export const REPORTS_ACCESS_PERMISSIONS = [
  "reportes.generate",
  "reportes.export",
];

export const CAPABILITIES = {
  ADMIN_ROLES_MANAGE: "cap.admin.roles.manage",
  ADMIN_USERS_MANAGE: "cap.admin.users.manage",
  AUDIT_VIEW: "cap.audit.view",
  EVIDENCE_ASSIGN: "cap.evidence.assign",
  EVIDENCE_VIEW: "cap.evidence.view",
  EVIDENCE_UPLOAD: "cap.evidence.upload",
  EXTENSION_MANAGE: "cap.extension.manage",
  EXTENSION_VIEW: "cap.extension.view",
  ACCREDITATION_PROCESS_VIEW: "cap.accreditation.process.view",
  ACCREDITATION_MODEL_VIEW: "cap.accreditation.model.view",
  ACCREDITATION_CYCLE_VIEW: "cap.accreditation.cycle.view",
  IMPROVEMENT_ACCESS: "cap.improvement.access",
  APPROVALS_VIEW: "cap.approvals.view",
  REPORTS_ACCESS: "cap.reports.access",
} as const;

/**
 * Grupos de permisos equivalentes que representan una misma capacidad.
 */
export const PERMISSION_EQUIVALENCE_GROUPS: string[][] = [
  EVIDENCE_ASSIGNMENT_PERMISSIONS,
  EVIDENCE_VIEW_PERMISSIONS,
];

const permissionAliasIndex: Record<string, string[]> =
  PERMISSION_EQUIVALENCE_GROUPS.reduce<Record<string, string[]>>(
    (acc, group) => {
      const aliases = Array.from(new Set(group));
      for (const permission of aliases) {
        acc[permission] = aliases;
      }
      return acc;
    },
    {},
  );

export const getEquivalentPermissions = (permission: string): string[] => {
  return permissionAliasIndex[permission] ?? [permission];
};

export const hasPermissionCapability = (
  userPermissions: Set<string>,
  requiredPermission: string,
): boolean => {
  return getEquivalentPermissions(requiredPermission).some((permission) =>
    userPermissions.has(permission),
  );
};
