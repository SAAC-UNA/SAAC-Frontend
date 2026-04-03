import React from 'react';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface StatusBadgeProps {
    label: string;
    colorClasses: string;
    badgeClassName?: string;
    /** 'md' (default, 12px) | 'sm' (10px, para tarjetas y espacios reducidos) */
    size?: 'md' | 'sm';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, colorClasses, badgeClassName, size = 'md' }) => {
  const sizeClasses = size === 'sm'
    ? `${TYPOGRAPHY.badgeSm} px-1.5 py-0`
    : `${TYPOGRAPHY.badge} px-2 py-1`;

  return (
    <div className={`relative grid items-center w-max font-sans font-bold rounded-corner select-none whitespace-nowrap ${sizeClasses} ${colorClasses} ${badgeClassName ?? ''}`}>
        <span className="leading-none">{label}</span>
    </div>
  );
};
