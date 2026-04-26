import React, { useMemo } from "react";
import {
  ActionCard,
  type ActionCardAction,
  type ActionCardBadge,
  BackendErrorAlert,
  LoadingSpinner,
} from "@/Components/Ui/Index";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { STATUS_BADGE, BADGE_COLORS } from "@/Constants/StatusBadges";
import type { Role } from "@/Services/RoleService";
import { cn } from "@/Utils/ClassNames";
import { truncateText } from "@/Utils";

interface RolesCardsProps {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onRetry?: () => Promise<unknown> | void;
  onViewPermissions: (role: Role) => void;
  onEdit: (role: Role) => void;
  onToggleStatus: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const RolesCards: React.FC<RolesCardsProps> = ({
  roles,
  isLoading,
  error,
  searchQuery,
  onRetry,
  onViewPermissions,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) {
      return roles;
    }

    const needle = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(needle) ||
        (role.description ?? "").toLowerCase().includes(needle),
    );
  }, [roles, searchQuery]);

  if (error) {
    return (
      <BackendErrorAlert
        error={error}
        onRetry={async () => {
          await onRetry?.();
        }}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner variant="loader" />;
  }

  if (filteredRoles.length === 0) {
    return (
      <p
        className={cn(
          TYPOGRAPHY.body,
          "text-gris-una col-span-full text-center py-12",
        )}
      >
        {searchQuery.trim()
          ? "No se encontraron roles que coincidan con la busqueda."
          : "No hay roles creados aun."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredRoles.map((role) => {
        const badges: ActionCardBadge[] = [
          {
            label: `${Array.isArray(role.permissions) ? role.permissions.length : 0} permisos`,
            colorClasses: BADGE_COLORS.gris.colorClasses,
          },
          STATUS_BADGE[role.is_active ? 'active' : 'inactive'],
        ];

        const actions: ActionCardAction[] = [
          {
            id: "view",
            action: "view",
            tooltip: "Ver permisos",
            onClick: () => onViewPermissions(role),
          },
          {
            id: "edit",
            action: "edit",
            tooltip: "Editar rol",
            onClick: () => onEdit(role),
          },
          {
            id: "toggle",
            action: "power",
            tooltip: role.is_active ? "Inactivar rol" : "Activar rol",
            onClick: () => onToggleStatus(role),
            isActive: role.is_active,
          },
          {
            id: "delete",
            action: "delete",
            tooltip: role.is_protected
              ? "Los roles del sistema no pueden eliminarse"
              : role.users_count > 0
                ? `No se puede eliminar: tiene ${role.users_count} usuarios asignados`
                : "Eliminar rol",
            onClick: () => onDelete(role),
            disabled: !role.can_delete,
          },
        ];

        return (
          <ActionCard
            key={role.id}
            title={role.name}
            titleTooltip={role.name}
            subtitle={role.description ? truncateText(role.description, 90) : "Sin descripcion"}
            badges={badges}
            details={
              <p className="text-xs text-gris-una wrap-anywhere">
                {role.is_protected
                  ? "Rol protegido por el sistema"
                  : `Usuarios asignados: ${role.users_count}`}
              </p>
            }
            actions={actions}
            muted={!role.is_active}
          />
        );
      })}
    </div>
  );
};
