import React, { useEffect, useMemo } from 'react';
import { Modal } from '../../../Components/Ui/Modals/Modal';
import { SystemIcons } from '../../../Components/Ui/Icons/SystemIcons';
import { cn } from '../../../Utils/ClassNames';
import { TYPOGRAPHY } from '../../../Constants/Typography';
import { ICON_SIZES } from '../../../Constants/Components';
import { useRoles } from '@/Hooks/UseRoles';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';

interface BackendPermission {
  id: number;
  name: string;
  label: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleName: string;
  roleDescription?: string;
  permissions: BackendPermission[] | string[];
  getPermissionLabel?: (permission: string) => string;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  roleName,
  roleDescription,
  permissions,
  getPermissionLabel,
}) => {
  const { availablePermissionGroups, loadPermissions, isLoading: groupsLoading } = useRoles();

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  // Agrupar permisos según los grupos disponibles
  const groupedPermissions = useMemo(() => {
    if (!availablePermissionGroups.length || !permissions.length) return null;

    const permissionNames = new Set(
      permissions.map(p => (typeof p === 'object' ? p.name : p))
    );

    const getLabelFor = (name: string): string => {
      const obj = permissions.find(p => typeof p === 'object' && p.name === name);
      if (obj && typeof obj === 'object') return obj.label;
      if (getPermissionLabel) return getPermissionLabel(name);
      return name;
    };

    const usedNames = new Set<string>();
    const groups: { key: string; label: string; items: { name: string; label: string }[] }[] = [];

    for (const group of availablePermissionGroups) {
      const items = group.permissions
        .filter(p => permissionNames.has(p.value))
        .map(p => ({ name: p.value, label: getLabelFor(p.value) }));
      if (items.length > 0) {
        items.forEach(i => usedNames.add(i.name));
        groups.push({ key: group.key, label: group.label, items });
      }
    }

    // Permisos que no pertenecen a ningún grupo
    const uncategorized = [...permissionNames]
      .filter(n => !usedNames.has(n))
      .map(n => ({ name: n, label: getLabelFor(n) }));

    if (uncategorized.length > 0) {
      groups.push({ key: '__other__', label: 'Otros', items: uncategorized });
    }

    return groups;
  }, [availablePermissionGroups, permissions, getPermissionLabel]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roleName}
      subtitle="Permisos del rol"
      heroBadge={`${permissions.length} permiso${permissions.length !== 1 ? 's' : ''}`}
      heroIcon={
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35">
          <SystemIcons.modal.key className={`${ICON_SIZES.lg} text-white`} />
        </div>
      }
      variant="info"
      size="lg"
      maxHeight="lg"
      showCancel={false}
      showConfirm={false}
    >
      <div className="flex flex-col gap-4">
        {/* Descripción del rol */}
        {roleDescription && (
          <>
            <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed wrap-break-word')}>{roleDescription}</p>
            <hr className="border-gray-200" />
          </>
        )}

        {/* Lista de permisos */}
        {permissions.length > 0 ? (
          groupsLoading && !groupedPermissions ? (
            <div className="relative py-8 min-h-32">
              <LoadingSpinner variant="loader" />
            </div>
          ) : groupedPermissions ? (
            <div className="flex flex-col gap-4">
              {groupedPermissions.map((group, gi) => (
                <div key={group.key}>
                  {gi > 0 && <hr className="border-gray-100 mb-3" />}
                  <p className={cn(TYPOGRAPHY.form.helper, 'uppercase tracking-wider font-semibold text-gris-una-2 mb-2')}>
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {group.items.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-verde shrink-0" />
                        <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 truncate')}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-72 overflow-y-auto">
              {permissions.map((permission, index) => {
                const isObject = typeof permission === 'object' && permission !== null;
                const label = isObject
                  ? (permission as BackendPermission).label
                  : (getPermissionLabel ? getPermissionLabel(permission as string) : permission as string);
                const key = isObject ? (permission as BackendPermission).id : index;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-verde shrink-0" />
                    <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 truncate')}>{label}</span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 text-center py-2')}>
            Este rol no tiene permisos asignados
          </p>
        )}
      </div>
    </Modal>
  );
};