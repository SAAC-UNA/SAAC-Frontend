import React, { useEffect, useMemo, useState } from "react";
import { Input, Textarea, Button, Card } from "@/components/Ui/Index";
import { useBreakpoint } from "@/hooks/UseBreakpoint";
import { useRoles } from "@/Hooks/UseRoles";
import { validationRules, useValidation } from "@/Utils/Validation";
import type { CreateRoleData, Role } from "@/Services/RoleService";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { ICON_SIZES } from "@/Constants/Components";
import { PermissionsTable } from "@/Components/Ui/Table/PermissionsTable";
import type { PermissionsTableColumn } from "@/Components/Ui/Table/PermissionsTable";
import type { PermissionGroupOption } from "@/Types/RoleTypes";

type MatrixAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "upload"
  | "download"
  | "make_public"
  | "approve"
  | "reject"
  | "cancel"
  | "generate"
  | "export"
  | "reactivar";

const ACTION_ORDER: MatrixAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "assign",
  "upload",
  "download",
  "make_public",
  "approve",
  "reject",
  "cancel",
  "generate",
  "export",
  "reactivar",
];

const ACTION_LABELS: Record<MatrixAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
  assign: "Asignar",
  upload: "Subir",
  download: "Descargar",
  make_public: "Publico",
  approve: "Aprobar",
  reject: "Rechazar",
  cancel: "Cancelar",
  generate: "Generar",
  export: "Exportar",
  reactivar: "Reactivar",
};

const titleCase = (value: string): string =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getModuleLabel = (moduleName: string): string => {
  if (moduleName === "campuses") return "Campuses";
  return titleCase(moduleName);
};

const getModuleName = (permissionValue: string): string =>
  permissionValue.split(".")[0] ?? "";
const getActionName = (permissionValue: string): string =>
  permissionValue.split(".").slice(1).join(".") ?? "";
const isAction = (value: string): value is MatrixAction =>
  ACTION_ORDER.includes(value as MatrixAction);

interface ModuleRow {
  [key: string]: unknown;
  moduleName: string;
  moduleLabel: string;
  permissions: Array<{ action: MatrixAction; value: string; label: string }>;
}

const buildModuleRows = (group: PermissionGroupOption): ModuleRow[] => {
  const map = new Map<string, ModuleRow>();

  group.permissions.forEach((permission) => {
    const moduleName = getModuleName(permission.value);
    const actionName = getActionName(permission.value);

    if (!moduleName || !isAction(actionName)) return;

    const current = map.get(moduleName) ?? {
      moduleName,
      moduleLabel: getModuleLabel(moduleName),
      permissions: [],
    };

    current.permissions.push({
      action: actionName,
      value: permission.value,
      label: permission.label,
    });
    map.set(moduleName, current);
  });

  return Array.from(map.values());
};

const countSelectedGroups = (
  groups: PermissionGroupOption[],
  selected: string[],
): number =>
  groups.filter((group) =>
    group.permissions.some((permission) => selected.includes(permission.value)),
  ).length;

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const validationSchema = {
  name: [
    validationRules.required("El nombre del rol es obligatorio"),
    validationRules.minLength(3, "El nombre debe tener al menos 3 caracteres"),
    validationRules.maxLength(50, "El nombre no puede exceder 50 caracteres"),
    validationRules.roleName("Solo se permiten letras, espacios y acentos"),
  ],
  description: [
    validationRules.minLength(
      10,
      "La descripcion debe tener al menos 10 caracteres",
    ),
    validationRules.maxLength(
      255,
      "La descripcion no puede exceder 255 caracteres",
    ),
    validationRules.comment(
      "Solo se permiten letras, numeros, espacios y signos de puntuacion basicos",
    ),
  ],
  permissions: [
    validationRules.minSelected(1, "Debe seleccionar al menos un permiso"),
  ],
};

const PermissionGroupMatrix: React.FC<{
  group: PermissionGroupOption;
  value: string[];
  onChange: (next: string[]) => void;
}> = ({ group, value, onChange }) => {
  const moduleRows = useMemo(() => buildModuleRows(group), [group]);
  const selectedValues = group.permissions
    .map((permission) => permission.value)
    .filter((permissionValue) => value.includes(permissionValue));
  const selectedCount = selectedValues.length;
  const allSelected =
    selectedCount === group.permissions.length && group.permissions.length > 0;

  const visibleActions = useMemo(() => {
    const actionSet = new Set<string>();
    group.permissions.forEach((permission) => {
      const action = getActionName(permission.value);
      if (isAction(action)) actionSet.add(action);
    });
    return ACTION_ORDER.filter((action) => actionSet.has(action));
  }, [group]);

  const toggleGroup = () => {
    onChange(
      allSelected
        ? []
        : group.permissions.map((permission) => permission.value),
    );
  };

  const togglePermission = (permissionValue: string) => {
    const next = new Set(selectedValues);
    if (next.has(permissionValue)) {
      next.delete(permissionValue);
    } else {
      next.add(permissionValue);
    }
    onChange(Array.from(next));
  };

  const columns = useMemo<PermissionsTableColumn<ModuleRow>[]>(() => {
    const moduleColumn: PermissionsTableColumn<ModuleRow> = {
      key: "module",
      header: "Modulo",
      accessor: "moduleLabel",
      align: "left",
      render: (_value, item) => (
        <div className="flex flex-col gap-0.5 leading-tight">
          <span
            className={`${TYPOGRAPHY.table.cell} font-semibold text-negro-una`}
          >
            {item.moduleLabel}
          </span>
          <span className={`${TYPOGRAPHY.table.helper} text-gris-una`}>
            {item.permissions.length}{" "}
            {item.permissions.length === 1 ? "permiso" : "permisos"}
          </span>
        </div>
      ),
    };

    const actionColumns: PermissionsTableColumn<ModuleRow>[] =
      visibleActions.map((action) => ({
        key: action,
        header: ACTION_LABELS[action],
        align: "center",
        render: (_value, item) => {
          const permission = item.permissions.find(
            (entry) => entry.action === action,
          );
          const selected = permission
            ? selectedValues.includes(permission.value)
            : false;

          if (!permission) {
            return (
              <span
                className={`inline-flex h-8 w-full items-center justify-center rounded-corner border border-dashed border-gris-una/15 text-gris-una ${TYPOGRAPHY.table.helper}`}
              >
                -
              </span>
            );
          }

          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => togglePermission(permission.value)}
              className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors focus:outline-none focus:ring-2 focus:ring-verde/40 focus:ring-offset-1 cursor-pointer ${selected ? "border-verde bg-verde" : "border-gris-una/40 bg-white"}`}
              aria-label={`${item.moduleLabel} - ${ACTION_LABELS[action]}`}
              title={permission.label}
            >
              {selected && (
                <SystemIcons.interface.check className="h-3 w-3 text-white" />
              )}
            </button>
          );
        },
      }));

    return [moduleColumn, ...actionColumns];
  }, [selectedValues, visibleActions]);

  return (
    <Card className="overflow-hidden ">
      <div className="flex items-center justify-between gap-3 border-b border-gris-una/10 bg-blanco-una px-3 py-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
            >
              {group.label}
            </h4>
            <span
              className={`${TYPOGRAPHY.badge} rounded-full bg-gris-una/10 px-2 py-0.5 text-gris-una`}
            >
              {selectedCount}/{group.permissions.length}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleGroup}
          className="w-auto! shrink-0 shadow-none!"
        >
          {allSelected ? "Quitar todo" : "Seleccionar todo"}
        </Button>
      </div>

      <PermissionsTable<ModuleRow>
        data={moduleRows}
        columns={columns}
        searchable={false}
        unstyled
        emptyMessage="No hay permisos en este grupo"
      />
    </Card>
  );
};

const RolePermissionMatrixField: React.FC<{
  groups: PermissionGroupOption[];
  value: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
  error?: string;
}> = ({ groups, value, onChange, loading = false, error }) => {
  const groupCount = groups.length;
  const selectedPermissionsCount = value.length;
  const selectedGroupsCount = countSelectedGroups(groups, value);

  if (loading && groupCount === 0) {
    return (
      <Card className="p-4 ">
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
          Cargando permisos disponibles...
        </p>
      </Card>
    );
  }

  if (groupCount === 0) {
    return (
      <Card className="p-4 ">
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
          No hay permisos disponibles
        </p>
      </Card>
    );
  }

  const handleClearAll = () => onChange([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
          >
            Permisos
          </h3>
          <p className={`${TYPOGRAPHY.form.helper} mt-1 text-gris-una`}>
            {selectedPermissionsCount}{" "}
            {selectedPermissionsCount === 1 ? "permiso" : "permisos"} en{" "}
            {selectedGroupsCount}{" "}
            {selectedGroupsCount === 1 ? "grupo" : "grupos"}.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="w-auto! min-w-0! px-2"
          title="Limpiar seleccion"
          aria-label="Limpiar seleccion"
        >
          <SystemIcons.interface.refresh className={ICON_SIZES.sm} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groups.map((group) => (
          <PermissionGroupMatrix
            key={group.key}
            group={group}
            value={value}
            onChange={(nextValues) => {
              const targetGroup = groups.find((item) => item.key === group.key);
              if (!targetGroup) return;

              const groupPermissionValues = new Set(
                targetGroup.permissions.map((permission) => permission.value),
              );
              const next = new Set(
                value.filter(
                  (permissionValue) =>
                    !groupPermissionValues.has(permissionValue),
                ),
              );
              nextValues.forEach((permissionValue) =>
                next.add(permissionValue),
              );
              onChange(Array.from(next));
            }}
          />
        ))}
      </div>

      {error && (
        <div
          className={`${TYPOGRAPHY.form.helper} rounded-corner border border-rojo-una-2/20 bg-rojo-una-2/5 p-3 text-rojo-una-2`}
        >
          {error}
        </div>
      )}
    </div>
  );
};

interface RoleFormProps {
  onSubmit?: (roleData: CreateRoleData) => void;
  onCancel?: () => void;
  initialData?: Role;
  hideButtons?: boolean;
  onHasChangesChange?: (hasChanges: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  hideButtons = false,
  onHasChangesChange,
  formRef,
}) => {
  const isEditing = !!initialData;
  const { isDesktop } = useBreakpoint();
  const {
    loadPermissions,
    availablePermissionGroups,
    isLoading,
    error,
    clearError,
  } = useRoles();

  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    permissions:
      initialData?.permissions.map((permission) => permission.name) ?? [],
  });
  const [hasChanges, setHasChanges] = useState(!isEditing);

  const validation = useValidation({
    schema: validationSchema,
    validateOnChange: false,
  });

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    if (!isEditing) {
      setHasChanges(true);
      onHasChangesChange?.(true);
      return;
    }

    const nameChanged = formData.name.trim() !== (initialData?.name ?? "");
    const descChanged =
      formData.description.trim() !== (initialData?.description ?? "");
    const initialPermissions = [
      ...(initialData?.permissions.map((permission) => permission.name) ?? []),
    ].sort();
    const currentPermissions = [...formData.permissions].sort();
    const permissionsChanged =
      JSON.stringify(initialPermissions) !== JSON.stringify(currentPermissions);
    const currentHasChanges = nameChanged || descChanged || permissionsChanged;

    setHasChanges(currentHasChanges);
    onHasChangesChange?.(currentHasChanges);
  }, [formData, initialData, isEditing, onHasChangesChange]);

  const setFieldValue = (
    field: keyof RoleFormData,
    value: string | string[],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      clearError();
    }
  };

  const handleFieldFocus = (field: keyof RoleFormData) => {
    validation.clearFieldError(field);
  };

  const handleRealTimeValidation = (
    field: "name" | "description",
    value: string,
  ) => {
    const immediateRule =
      field === "name"
        ? validationRules.roleNameImmediate()
        : validationRules.commentImmediate();

    if (!immediateRule.validate(value)) {
      validation.errors[field] = immediateRule.message;
      return;
    }

    validation.clearFieldError(field);
  };

  const submitForm = (): boolean => {
    if (!validation.validateForm(formData)) {
      return false;
    }

    onSubmit?.({
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.permissions,
    });

    return true;
  };

  const isLoadingPermissions = isLoading;
  const apiError = error;
  const errors = validation.errors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <Card className="p-4 space-y-5 ">
        <Input
          label="Nombre del Rol"
          placeholder="Ej: Administrador, Profesor..."
          value={formData.name}
          onChange={(e) => setFieldValue("name", e.target.value)}
          onFocus={() => handleFieldFocus("name")}
          onValidateChange={(value) => handleRealTimeValidation("name", value)}
          error={errors.name}
          required
          maxLength={50}
          characterCount={true}
          validateOnChange={true}
          size="sm"
        />

        <Textarea
          label="Descripción"
          placeholder="Descripción del rol..."
          value={formData.description}
          onChange={(e) => setFieldValue("description", e.target.value)}
          onFocus={() => handleFieldFocus("description")}
          error={errors.description}
          rows={isDesktop ? 6 : 4}
          resize="vertical"
          size="sm"
          maxLength={255}
          characterCount={true}
          helperText="Descripción opcional del rol y sus responsabilidades"
          validateOnChange={true}
          onValidateChange={(value) =>
            handleRealTimeValidation("description", value)
          }
        />

        <RolePermissionMatrixField
          groups={availablePermissionGroups}
          value={formData.permissions}
          onChange={(values) => setFieldValue("permissions", values)}
          loading={isLoadingPermissions}
          error={errors.permissions}
        />

        {apiError && (
          <div className="mb-2 p-4 bg-red-50 border border-red-200 rounded-corner">
            <p className="text-sm text-rojo-una">{apiError}</p>
          </div>
        )}

        {!hideButtons && (
          <div className="flex gap-4 pt-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoadingPermissions}
              standardWidth={true}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoadingPermissions}
              loadingText={isEditing ? "Guardando" : "Creando"}
              disabled={isLoadingPermissions || !hasChanges}
              standardWidth={true}
              size="sm"
            >
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
};
