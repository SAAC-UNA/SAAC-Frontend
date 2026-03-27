import React from 'react';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';

const COMPROMISO_STATUS_BADGE: Record<string, { label: string; colorClasses: string }> = {
  Pendiente:    { label: 'Pendiente',    colorClasses: 'text-warning-dark bg-warning-ring' },
  'En Progreso': { label: 'En Progreso', colorClasses: 'text-info-dark bg-info-ring' },
  Completado:   { label: 'Completado',   colorClasses: 'text-verde-dark bg-verde-ring' },
  Vencido:      { label: 'Vencido',      colorClasses: 'text-error-dark bg-error-ring' },
};

interface CompromisoStatusBadgeProps {
  estado: string;
}

export const CompromisoStatusBadge: React.FC<CompromisoStatusBadgeProps> = ({ estado }) => {
  const config = COMPROMISO_STATUS_BADGE[estado] ?? COMPROMISO_STATUS_BADGE['Pendiente'];
  return <StatusBadge label={config.label} colorClasses={config.colorClasses} />;
};
