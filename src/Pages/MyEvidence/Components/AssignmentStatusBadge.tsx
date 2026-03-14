/**
 * AssignmentStatusBadge - Badge para mostrar el estado de una asignación
 * HU-029 - Mis Evidencias Asignadas
 */

import React from 'react';
import { StatusBadge } from '@/Components/Ui/StatusBadge';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';

const STATUS_BADGE_CLASSES: Record<AssignmentStatus, { label: string; colorClasses: string }> = {
  pendiente:   { label: 'Pendiente',   colorClasses: 'text-warning-dark bg-warning-ring' },
  en_progreso: { label: 'En Progreso', colorClasses: 'text-info-dark bg-info-ring' },
  completado:  { label: 'Completado',  colorClasses: 'text-verde-dark bg-verde-ring' },
  vencido:     { label: 'Vencido',     colorClasses: 'text-error-dark bg-error-ring' },
};

interface AssignmentStatusBadgeProps {
  estado: AssignmentStatus;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ estado }) => {
  const { label, colorClasses } = STATUS_BADGE_CLASSES[estado];
  return <StatusBadge label={label} colorClasses={colorClasses} />;
};
