import React from 'react';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface StatusBadgeProps {
    label: string;
    colorClasses: string;
    badgeClassName?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, colorClasses }) => (
    <div className={`relative grid items-center w-max px-2 py-1 font-sans font-bold rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.badge} ${colorClasses}`}>
        <span>{label}</span>
    </div>
);
