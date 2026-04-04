import React from 'react';
import { Button, Card } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { PermissionGroupOption } from '@/Types/RoleTypes';

interface PermissionGroupsFieldProps {
  groups: PermissionGroupOption[];
  value: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
  error?: string;
  emptyLabel?: string;
}

const ACTION_ORDER = [
  'view',
  'create',
  'edit',
  'delete',
  'assign',
  'upload',
  'download',
  'make_public',
  'approve',
  'reject',
  'cancel',
  'generate',
  'export',
  'reactivar',
] as const;

const ACTION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  assign: 'Asignar',
  upload: 'Subir',
  download: 'Descargar',
  make_public: 'Público',
  approve: 'Aprobar',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  generate: 'Generar',
  export: 'Exportar',
  reactivar: 'Reactivar',
};

const toTitleCase = (value: string): string =>
  value
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getModuleName = (permissionValue: string): string => {
  const [moduleName] = permissionValue.split('.');
  return moduleName || '';
};

const getActionName = (permissionValue: string): string => {
  const parts = permissionValue.split('.');
  return parts.slice(1).join('.') || '';
};

const getActionLabel = (actionName: string): string => {
  return ACTION_LABELS[actionName] ?? toTitleCase(actionName);
};

const getModuleLabel = (moduleName: string): string => {
  if (moduleName === 'campuses') return 'Sedes';
  return toTitleCase(moduleName);
};

interface ModuleRow {
  moduleName: string;
  moduleLabel: string;
  permissions: Array<{ action: string; option: { value: string; label: string } }>;
}

const countSelectedGroups = (groups: PermissionGroupOption[], selected: string[]): number => {
  return groups.filter((group) => group.permissions.some((permission) => selected.includes(permission.value))).length;
};

const getGroupModuleRows = (group: PermissionGroupOption): ModuleRow[] => {
  const rows = new Map<string, ModuleRow>();

  group.permissions.forEach((permission) => {
    const moduleName = getModuleName(permission.value);
    const actionName = getActionName(permission.value);
    if (!moduleName || !actionName) return;

    const current = rows.get(moduleName) ?? {
      moduleName,
      moduleLabel: getModuleLabel(moduleName),
      permissions: [],
    };

    current.permissions.push({
      action: actionName,
      option: permission,
    });
    rows.set(moduleName, current);
  });

  return Array.from(rows.values());
};

interface PermissionGroupCardProps {
  group: PermissionGroupOption;
  value: string[];
  onChangeGroupValues: (groupKey: string, nextGroupValues: string[]) => void;
}

const PermissionGroupCard: React.FC<PermissionGroupCardProps> = ({
  group,
  value,
  onChangeGroupValues,
}) => {
  const selectedCount = group.permissions.filter((permission) => value.includes(permission.value)).length;
  const allSelected = selectedCount === group.permissions.length && group.permissions.length > 0;
  const moduleRows = getGroupModuleRows(group);
  const groupSelectedValues = group.permissions
    .map((permission) => permission.value)
    .filter((permissionValue) => value.includes(permissionValue));

  const handleToggleGroup = () => {
    onChangeGroupValues(
      group.key,
      allSelected ? [] : group.permissions.map((permission) => permission.value)
    );
  };

  return (
    <Card className="p-4 border border-gris-una/15 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}>{group.label}</h3>
              <span className={`${TYPOGRAPHY.badge} text-gris-una bg-gris-una/10 px-2 py-0.5 rounded-full`}>
                {selectedCount}/{group.permissions.length}
              </span>
            </div>

            {group.description && (
              <p className={`${TYPOGRAPHY.form.helper} mt-1 text-gris-una`}>
                {group.description}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant={allSelected ? 'outline' : 'ghost'}
            size="sm"
            onClick={handleToggleGroup}
            className="!w-auto shrink-0 self-center"
          >
            {allSelected ? 'Quitar todo' : 'Seleccionar todo'}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-corner border border-gris-una/15 bg-blanco-una">
          <table className="min-w-full border-collapse">
            <thead className="bg-gris-una/5">
              <tr>
                <th className="sticky left-0 z-10 bg-gris-una/5 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gris-una border-b border-gris-una/10">
                  Módulo
                </th>
                {ACTION_ORDER.filter(action => group.permissions.some(permission => getActionName(permission.value) === action)).map((action) => (
                  <th key={action} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gris-una border-b border-gris-una/10">
                    {getActionLabel(action)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moduleRows.map((row) => (
                <tr key={row.moduleName} className="border-b border-gris-una/10 last:border-b-0">
                  <th className="sticky left-0 z-10 bg-blanco-una px-3 py-3 text-left align-middle border-r border-gris-una/10">
                    <div className="flex flex-col gap-1">
                      <span className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}>{row.moduleLabel}</span>
                      <span className={`${TYPOGRAPHY.form.helper} text-gris-una`}>{row.permissions.length} permiso(s)</span>
                    </div>
                  </th>
                  {ACTION_ORDER
                    .filter(action => group.permissions.some(permission => getActionName(permission.value) === action))
                    .map((action) => {
                      const permission = row.permissions.find(item => item.action === action)?.option;
                      const selected = permission ? value.includes(permission.value) : false;

                      return (
                        <td key={`${row.moduleName}-${action}`} className="px-2 py-2 text-center align-middle">
                          {permission ? (
                            <Button
                              type="button"
                              variant={selected ? 'success' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const nextValues = selected
                                  ? groupSelectedValues.filter(currentValue => currentValue !== permission.value)
                                  : [...groupSelectedValues, permission.value];
                                onChangeGroupValues(group.key, nextValues);
                              }}
                              className="!w-full !px-2 !py-1.5 !h-9 text-xs"
                              title={permission.label}
                            >
                              {getActionLabel(action)}
                            </Button>
                          ) : (
                            <span className="inline-flex h-9 w-full items-center justify-center rounded-corner border border-dashed border-gris-una/15 text-xs text-gris-una">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export const PermissionGroupsField: React.FC<PermissionGroupsFieldProps> = ({
  groups,
  value,
  onChange,
  loading = false,
  error,
  emptyLabel = 'No hay permisos disponibles',
}) => {
  const groupCount = groups.length;
  const selectedPermissionsCount = value.length;
  const selectedGroupsCount = countSelectedGroups(groups, value);

  if (loading && groupCount === 0) {
    return (
      <Card className="p-4 border border-gris-light/60">
        <p className="text-sm text-gris-una">Cargando permisos disponibles...</p>
      </Card>
    );
  }

  if (groupCount === 0) {
    return (
      <Card className="p-4 border border-gris-light/60">
        <p className="text-sm text-gris-una">{emptyLabel}</p>
      </Card>
    );
  }

  const onChangeGroupValues = (groupKey: string, nextGroupValues: string[]) => {
    const targetGroup = groups.find((group) => group.key === groupKey);
    if (!targetGroup) return;

    const groupPermissionValues = new Set(targetGroup.permissions.map((permission) => permission.value));
    const next = new Set(value.filter((permissionValue) => !groupPermissionValues.has(permissionValue)));

    nextGroupValues.forEach((permissionValue) => next.add(permissionValue));
    onChange(Array.from(next));
  };

  const handleSelectAll = () => {
    const all = groups.flatMap((group) => group.permissions.map((permission) => permission.value));
    onChange(Array.from(new Set(all)));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}>Matriz de Permisos</h3>
          <p className={`${TYPOGRAPHY.form.helper} text-gris-una mt-1`}>
            Selecciona permisos por módulo y acción. {selectedPermissionsCount} permiso(s) en {selectedGroupsCount} grupo(s).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="!w-auto"
          >
            Seleccionar todo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="!w-auto"
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groups.map((group) => (
          <PermissionGroupCard
            key={group.key}
            group={group}
            value={value}
            onChangeGroupValues={onChangeGroupValues}
          />
        ))}
      </div>

      {error && (
        <div className={`${TYPOGRAPHY.form.helper} p-3 bg-rojo-una-2/5 border border-rojo-una-2/20 rounded-corner text-rojo-una-2`}>
          {error}
        </div>
      )}
    </div>
  );
};
