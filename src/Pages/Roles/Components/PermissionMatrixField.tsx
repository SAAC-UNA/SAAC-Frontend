import React, { useMemo } from 'react';
import { Button, Card } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { ICON_SIZES } from '@/Constants/Components';
import { PermissionsTable } from '@/Components/Ui/Table/PermissionsTable';
import type { PermissionsTableColumn } from '@/Components/Ui/Table/PermissionsTable';
import type { PermissionGroupOption } from '@/Types/RoleTypes';

interface PermissionMatrixFieldProps {
  groups: PermissionGroupOption[];
  value: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
  error?: string;
  emptyLabel?: string;
}

type MatrixAction = 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'upload' | 'download' | 'make_public' | 'approve' | 'reject' | 'cancel' | 'generate' | 'export' | 'reactivar';

const ACTION_ORDER: MatrixAction[] = ['view', 'create', 'edit', 'delete', 'assign', 'upload', 'download', 'make_public', 'approve', 'reject', 'cancel', 'generate', 'export', 'reactivar'];

const ACTION_LABELS: Record<MatrixAction, string> = {
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

const titleCase = (value: string): string =>
  value
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getModuleLabel = (moduleName: string): string => {
  if (moduleName === 'campuses') return 'Campuses';
  return titleCase(moduleName);
};

const getModuleName = (permissionValue: string): string => permissionValue.split('.')[0] ?? '';
const getActionName = (permissionValue: string): string => permissionValue.split('.').slice(1).join('.') ?? '';

const isAction = (value: string): value is MatrixAction => ACTION_ORDER.includes(value as MatrixAction);

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

const countSelectedGroups = (groups: PermissionGroupOption[], selected: string[]): number =>
  groups.filter((group) => group.permissions.some((permission) => selected.includes(permission.value))).length;

const PermissionGroupMatrix: React.FC<{
  group: PermissionGroupOption;
  value: string[];
  onChange: (next: string[]) => void;
}> = ({ group, value, onChange }) => {
  const moduleRows = useMemo(() => buildModuleRows(group), [group]);
  const selectedValues = group.permissions.map((permission) => permission.value).filter((permissionValue) => value.includes(permissionValue));
  const selectedCount = selectedValues.length;
  const allSelected = selectedCount === group.permissions.length && group.permissions.length > 0;

  const visibleActions = useMemo(() => {
    const actionSet = new Set<string>();
    group.permissions.forEach((permission) => {
      const action = getActionName(permission.value);
      if (isAction(action)) actionSet.add(action);
    });
    return ACTION_ORDER.filter((action) => actionSet.has(action));
  }, [group]);

  const toggleGroup = () => {
    onChange(allSelected ? [] : group.permissions.map((permission) => permission.value));
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
      key: 'module',
      header: 'Módulo',
      accessor: 'moduleLabel',
      align: 'left',
      render: (_value, item) => (
        <div className="flex flex-col gap-0.5 leading-tight">
          <span className={`${TYPOGRAPHY.table.cell} font-semibold text-negro-una`}>{item.moduleLabel}</span>
          <span className={`${TYPOGRAPHY.table.helper} text-gris-una`}>
            {item.permissions.length} {item.permissions.length === 1 ? 'permiso' : 'permisos'}
          </span>
        </div>
      ),
    };

    const actionColumns: PermissionsTableColumn<ModuleRow>[] = visibleActions.map((action) => ({
      key: action,
      header: ACTION_LABELS[action],
      align: 'center',
      render: (_value, item) => {
        const permission = item.permissions.find((entry) => entry.action === action);
        const selected = permission ? selectedValues.includes(permission.value) : false;

        if (!permission) {
          return (
            <span className={`inline-flex h-8 w-full items-center justify-center rounded-corner border border-dashed border-gris-una/15 text-gris-una ${TYPOGRAPHY.table.helper}`}>
              —
            </span>
          );
        }

        return (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => togglePermission(permission.value)}
            className="h-4 w-4 rounded border-gris-una/40 text-info focus:ring-info"
            aria-label={`${item.moduleLabel} - ${ACTION_LABELS[action]}`}
            title={permission.label}
          />
        );
      },
    }));

    return [moduleColumn, ...actionColumns];
  }, [selectedValues, visibleActions]);

  return (
    <Card className="overflow-hidden border border-gris-una/15 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gris-una/10 bg-blanco-una px-3 py-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}>{group.label}</h4>
            <span className={`${TYPOGRAPHY.badge} rounded-full bg-gris-una/10 px-2 py-0.5 text-gris-una`}>
              {selectedCount}/{group.permissions.length}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant={allSelected ? 'outline' : 'ghost'}
          size="sm"
          onClick={toggleGroup}
          className="!w-auto shrink-0 !shadow-none"
        >
          {allSelected ? 'Quitar todo' : 'Seleccionar todo'}
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

export const PermissionMatrixField: React.FC<PermissionMatrixFieldProps> = ({
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
      <Card className="p-4 border border-gris-una/15 shadow-sm">
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>Cargando permisos disponibles...</p>
      </Card>
    );
  }

  if (groupCount === 0) {
    return (
      <Card className="p-4 border border-gris-una/15 shadow-sm">
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>{emptyLabel}</p>
      </Card>
    );
  }

  const handleClearAll = () => onChange([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}>Permisos</h3>
          <p className={`${TYPOGRAPHY.form.helper} mt-1 text-gris-una`}>
            {selectedPermissionsCount} {selectedPermissionsCount === 1 ? 'permiso' : 'permisos'} en{' '}
            {selectedGroupsCount} {selectedGroupsCount === 1 ? 'grupo' : 'grupos'}.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="!w-auto !min-w-0 px-2"
          title="Limpiar selección"
          aria-label="Limpiar selección"
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

              const groupPermissionValues = new Set(targetGroup.permissions.map((permission) => permission.value));
              const next = new Set(value.filter((permissionValue) => !groupPermissionValues.has(permissionValue)));
              nextValues.forEach((permissionValue) => next.add(permissionValue));
              onChange(Array.from(next));
            }}
          />
        ))}
      </div>

      {error && (
        <div className={`${TYPOGRAPHY.form.helper} rounded-corner border border-rojo-una-2/20 bg-rojo-una-2/5 p-3 text-rojo-una-2`}>
          {error}
        </div>
      )}
    </div>
  );
};