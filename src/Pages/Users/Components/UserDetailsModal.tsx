import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { STATUS_BADGE, BADGE_COLORS } from '@/Constants/StatusBadges';
import type { User } from '@/Services/UserService';

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

const Separator: React.FC = () => (
  <div className="col-span-4 py-1">
    <hr className="border-gray-200" />
  </div>
);


interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen, onClose, user,
}) => {
  if (!user) return null;

  const initials = getInitials(user.name);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user.name}
      subtitle="Detalles del usuario"
      heroIcon={
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 text-white font-bold text-base select-none">
          {initials}
        </div>
      }
      variant="info"
      size="lg"
      maxHeight="lg"
      showCancel={false}
      showConfirm={false}
    >
      <div className="grid grid-cols-4 gap-x-4 gap-y-3">

        {/* Nombre completo */}
        <InfoCell label="Nombre completo" className="col-span-2">
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 font-medium')}>{user.name}</span>
        </InfoCell>

        {/* Estado */}
        <InfoCell label="Estado" className="col-span-2 items-start">
          <StatusBadge
            label={STATUS_BADGE[user.status]?.label ?? user.status}
            colorClasses={STATUS_BADGE[user.status]?.colorClasses ?? BADGE_COLORS.gris.colorClasses}
          />
        </InfoCell>

        {/* Correo electrónico */}
        <InfoCell label="Correo electrónico" className={user.role ? 'col-span-2' : 'col-span-4'}>
          <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>{user.email}</span>
        </InfoCell>

        {/* Rol asignado */}
        {user.role && (
          <InfoCell label="Rol asignado" className="col-span-2 items-start">
            <StatusBadge
              label={user.role}
              colorClasses={BADGE_COLORS.info.colorClasses}
            />
          </InfoCell>
        )}

        {/* Permisos directos */}
        {user.allPermissions && user.allPermissions.length > 0 && (
          <>
            <Separator />
            <div className="col-span-4 grid grid-cols-2 gap-x-4 gap-y-2 max-h-52 overflow-y-auto">
              {user.allPermissions.map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-verde shrink-0" />
                  <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 truncate')}>{p.label}</span>
                </div>
              ))}
            </div>
            <p className={cn('col-span-4 text-gris-una-2', TYPOGRAPHY.form.helper)}>
              Total: {user.allPermissions.length} permiso{user.allPermissions.length !== 1 ? 's' : ''}
            </p>
          </>
        )}

      </div>
    </Modal>
  );
};