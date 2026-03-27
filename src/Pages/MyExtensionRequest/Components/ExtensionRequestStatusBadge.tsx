import React from 'react';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import type { ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';
import { EXTENSION_REQUEST_STATUS_BADGE } from '@/Constants/StatusBadges';

interface ExtensionRequestStatusBadgeProps {
  estado: ExtensionRequestStatus;
}

export const ExtensionRequestStatusBadge: React.FC<ExtensionRequestStatusBadgeProps> = ({ estado }) => {
  const { label, colorClasses } = EXTENSION_REQUEST_STATUS_BADGE[estado];
  return <StatusBadge label={label} colorClasses={colorClasses} />;
};
