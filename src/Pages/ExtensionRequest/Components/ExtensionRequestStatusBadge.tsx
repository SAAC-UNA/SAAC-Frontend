import React from 'react';
import { StatusBadge } from '@/Components/Ui/StatusBadge';
import type { ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';

const STATUS_BADGE: Record<ExtensionRequestStatus, { label: string; colorClasses: string }> = {
  pendiente: { label: 'Pendiente', colorClasses: 'text-warning-dark bg-warning-ring' },
  aprobada:  { label: 'Aprobada',  colorClasses: 'text-verde-dark bg-verde-ring' },
  rechazada: { label: 'Rechazada', colorClasses: 'text-error-dark bg-error-ring' },
};

interface ExtensionRequestStatusBadgeProps {
  estado: ExtensionRequestStatus;
}

export const ExtensionRequestStatusBadge: React.FC<ExtensionRequestStatusBadgeProps> = ({ estado }) => {
  const { label, colorClasses } = STATUS_BADGE[estado];
  return <StatusBadge label={label} colorClasses={colorClasses} />;
};
