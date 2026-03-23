/**
 * AssignmentStatusBadge - Badge para mostrar el estado de una asignación
 * HU-029 - Mis Evidencias Asignadas
 */

import React from 'react';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import { ASSIGNMENT_STATUS_BADGE } from '@/Constants/StatusBadges';

interface AssignmentStatusBadgeProps {
  estado: AssignmentStatus;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ estado }) => {
  const config = ASSIGNMENT_STATUS_BADGE[estado] ?? { label: estado, colorClasses: 'text-gray-600 bg-gray-100' };
  return <StatusBadge label={config.label} colorClasses={config.colorClasses} />;
};
