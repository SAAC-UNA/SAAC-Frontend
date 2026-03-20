import React from 'react';
import { Modal } from '../../../Components/Ui/Modals/Modal';
import { Button } from '../../../Components/Ui/Buttons/Button';
import { SystemIcons } from '../../../Components/Ui/Icons/SystemIcons';
import { cn } from '../../../Utils/ClassNames';
import { TYPOGRAPHY } from '../../../Constants/Typography';
import { ICON_SIZES } from '../../../Constants/Components';

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
      size="md"
      footerMeta={`Total: ${permissions.length} permiso${permissions.length !== 1 ? 's' : ''}`}
      footerButtons={
        <Button variant="outline" standardWidth onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Descripción del rol */}
        {roleDescription && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
                Descripción del rol
              </span>
            </div>
            <div className="border border-gray-200 rounded-corner p-4">
              <p className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 leading-relaxed')}>{roleDescription}</p>
            </div>
          </div>
        )}

        {/* Lista de permisos */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
              Permisos asignados
            </span>
          </div>

          {permissions.length > 0 ? (
            <div className="border border-gray-200 rounded-corner p-4 max-h-72 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {permissions.map((permission, index) => {
                  const isObject = typeof permission === 'object' && permission !== null;
                  const label = isObject
                    ? (permission as BackendPermission).label
                    : (getPermissionLabel ? getPermissionLabel(permission as string) : permission as string);
                  const key = isObject ? (permission as BackendPermission).id : index;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-verde flex-shrink-0" />
                      <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 truncate')}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-corner p-6 text-center">
              <p className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>Este rol no tiene permisos asignados</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};