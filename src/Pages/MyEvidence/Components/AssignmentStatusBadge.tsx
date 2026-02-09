/**
 * AssignmentStatusBadge - Badge para mostrar el estado de una asignación
 * HU-029 - Mis Evidencias Asignadas
 */

import React from 'react';
import type { AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import { STATUS_LABELS, STATUS_COLORS } from '@/Types/EvidenceAssignmentTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

interface AssignmentStatusBadgeProps {
  estado: AssignmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
  estado,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const colors = STATUS_COLORS[estado];
  const label = STATUS_LABELS[estado];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizeMap = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const
  };

  const getIcon = () => {
    switch (estado) {
      case 'pendiente':
        return SystemIcons.interface.clock({ size: iconSizeMap[size], color: 'currentColor' });
      case 'en_progreso':
        return SystemIcons.interface.refresh({ size: iconSizeMap[size], color: 'currentColor' });
      case 'completado':
        return SystemIcons.interface.checkCircle({ size: iconSizeMap[size], color: 'currentColor' });
      case 'vencido':
        return SystemIcons.interface.alert({ size: iconSizeMap[size], color: 'currentColor' });
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${colors.text} ${colors.bg} ${colors.border}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && <span className="flex-shrink-0">{getIcon()}</span>}
      <span>{label}</span>
    </span>
  );
};
