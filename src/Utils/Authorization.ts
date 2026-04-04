import { hasPermissionCapability } from "@/Constants/PermissionCapabilities";

export interface AccessRule {
  requireRoles?: string[];
  requireAnyPermissions?: string[];
  requireAllPermissions?: string[];
  requireAnyCapabilities?: string[];
  requireAllCapabilities?: string[];
}

interface AccessContext {
  roles?: string[];
  permissions?: string[];
  capabilities?: string[];
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
  const capabilitiesSet = toSet(context.capabilities);

  const requiresRoles = (rule.requireRoles?.length ?? 0) > 0;
  const hasRole = !requiresRoles
    ? true
    : rule.requireRoles!.some((role) => rolesSet.has(role));

  const requiresAnyPermission = (rule.requireAnyPermissions?.length ?? 0) > 0;
  const hasAnyPermission = !requiresAnyPermission
    ? true
    : rule.requireAnyPermissions!.some((permission) =>
        hasPermissionCapability(permissionsSet, permission),
      );

  const requiresAllPermissions = (rule.requireAllPermissions?.length ?? 0) > 0;
  const hasAllPermissions = !requiresAllPermissions
    ? true
    : rule.requireAllPermissions!.every((permission) =>
        hasPermissionCapability(permissionsSet, permission),
      );

  const requiresAnyCapability = (rule.requireAnyCapabilities?.length ?? 0) > 0;
  const hasAnyCapability = !requiresAnyCapability
    ? true
    : rule.requireAnyCapabilities!.some((capability) =>
        capabilitiesSet.has(capability),
      );

  const requiresAllCapabilities = (rule.requireAllCapabilities?.length ?? 0) > 0;
  const hasAllCapabilities = !requiresAllCapabilities
    ? true
    : rule.requireAllCapabilities!.every((capability) =>
        capabilitiesSet.has(capability),
      );

  const hasAnyAccessDimension =
    requiresAnyPermission && requiresAnyCapability
      ? hasAnyPermission || hasAnyCapability
      : hasAnyPermission && hasAnyCapability;

  const hasAllAccessDimension =
    requiresAllPermissions && requiresAllCapabilities
      ? hasAllPermissions || hasAllCapabilities
      : hasAllPermissions && hasAllCapabilities;

  return (
    hasRole &&
    hasAnyAccessDimension &&
    hasAllAccessDimension
  );
};

export const getUserRoleNames = (roles?: Array<{ name: string }>): string[] => {
  return (roles ?? []).map((role) => role.name);
};

export const getUserPermissionNames = (
  permissions?: Array<{ name: string }>,
): string[] => {
  return (permissions ?? []).map((permission) => permission.name);
};
