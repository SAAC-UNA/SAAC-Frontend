export interface AccessRule {
  requireRoles?: string[];
  requireAnyPermissions?: string[];
  requireAllPermissions?: string[];
}

interface AccessContext {
  roles?: string[];
  permissions?: string[];
}

const toSet = (values?: string[]): Set<string> => {
  return new Set((values ?? []).filter(Boolean));
};

export const evaluateAccess = (
  context: AccessContext,
  rule?: AccessRule,
): boolean => {
  if (!rule) {
    return true;
  }

  const rolesSet = toSet(context.roles);

  const permissionsSet = toSet(context.permissions);

  const requiresRoles = (rule.requireRoles?.length ?? 0) > 0;
  const hasRole = !requiresRoles
    ? true
    : rule.requireRoles!.some((role) => rolesSet.has(role));

  const requiresAnyPermission = (rule.requireAnyPermissions?.length ?? 0) > 0;
  const hasAnyPermission = !requiresAnyPermission
    ? true
    : rule.requireAnyPermissions!.some((permission) =>
        permissionsSet.has(permission),
      );

  const requiresAllPermissions = (rule.requireAllPermissions?.length ?? 0) > 0;
  const hasAllPermissions = !requiresAllPermissions
    ? true
    : rule.requireAllPermissions!.every((permission) =>
        permissionsSet.has(permission),
      );

  return hasRole && hasAnyPermission && hasAllPermissions;
};

export const getUserRoleNames = (roles?: Array<{ name: string }>): string[] => {
  return (roles ?? []).map((role) => role.name);
};

export const getUserPermissionNames = (
  permissions?: Array<{ name: string }>,
): string[] => {
  return (permissions ?? []).map((permission) => permission.name);
};
