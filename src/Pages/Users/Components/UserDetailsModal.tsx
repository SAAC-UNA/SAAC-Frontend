import React from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { User } from '@/Services/UserService';

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');

/*
const formatDate = (date?: Date): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);
};
*/


const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
  </div>
);

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
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

  const isActive = user.status === 'active';
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
      <div className="flex flex-col gap-5">

        {/* INFORMACIÓN PERSONAL */}
        <div>
          <SectionLabel  label="Información personal" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Nombre completo">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-medium')}>{user.name}</span>
            </InfoCell>
            <InfoCell label="Estado">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold',
                TYPOGRAPHY.badge,
                isActive
                  ? 'bg-verde-light text-verde-dark border border-verde-ring'
                  : 'bg-error-light text-error-dark border border-error-ring',
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isActive ? 'bg-verde' : 'bg-error')} />
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </InfoCell>
            {user.role && (
              <InfoCell label="Rol asignado">
                <span className={cn(
                  'inline-flex font-semibold text-azul-una',
                  TYPOGRAPHY.badge,
                )}>
                  {user.role}
                </span>
              </InfoCell>
            )}
            <InfoCell label="Correo electrónico" className={user.role ? '' : 'col-span-2'}>
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{user.email}</span>
            </InfoCell>
          </div>
        </div>
{/** 
        {/* REGISTRO *}
        <div>
          <SectionLabel label="Registro" />
          <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoCell label="Creación">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{formatDate(user.createdAt)}</span>
            </InfoCell>
            <InfoCell label="Última actualización">
              <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>{formatDate(user.updatedAt)}</span>
            </InfoCell>
          </div>
        </div>
*/}
        {/* PERMISOS DIRECTOS */}
        {user.allPermissions && user.allPermissions.length > 0 && (
          <div>
            <SectionLabel label="Permisos directos" />
            <div className="border border-gray-200 rounded-corner p-4 max-h-52 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {user.allPermissions.map(p => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-verde flex-shrink-0" />
                    <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 truncate')}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className={cn('mt-1.5 text-gris-una-2', TYPOGRAPHY.form.helper)}>
              Total: {user.allPermissions.length} permiso{user.allPermissions.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
};