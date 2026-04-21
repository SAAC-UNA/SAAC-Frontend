import React from "react";
import {
  TableActionButton,
  type TableActionType,
} from "@/Components/Ui/Buttons/TableActionButton";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { cn } from "@/Utils/ClassNames";

const DEFAULT_ACTION_CLASS = "!size-9 !p-1.5";

export interface ActionCardBadge {
  label: string;
  colorClasses: string;
}

export interface ActionCardAction {
  id: string;
  action: TableActionType;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  className?: string;
}

interface ActionCardProps {
  title: string;
  titleTooltip?: string;
  subtitle?: string | null;
  badges?: ActionCardBadge[];
  details?: React.ReactNode;
  actions?: ActionCardAction[];
  muted?: boolean;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  titleTooltip,
  subtitle,
  badges = [],
  details,
  actions = [],
  muted = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-corner bg-blanco-una border border-blanco-una shadow-md",
        "transition-shadow hover:shadow-lg",
        muted && "opacity-60",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              TYPOGRAPHY.pageSubtitle,
              "font-bold text-negro-una truncate",
            )}
            title={titleTooltip ?? title}
          >
            {title}
          </h3>

          {subtitle && (
            <span className={cn(TYPOGRAPHY.form.helper, "text-gris-una")}>{subtitle}</span>
          )}
        </div>

        {badges.length > 0 && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            {badges.map((badge, index) => (
              <StatusBadge
                key={`${badge.label}-${index}`}
                label={badge.label}
                colorClasses={badge.colorClasses}
              />
            ))}
          </div>
        )}
      </div>

      {details}

      {actions.length > 0 && (
        <div className="flex items-center justify-end gap-1 pt-2">
          {actions.map((cardAction) => (
            <TableActionButton
              key={cardAction.id}
              action={cardAction.action}
              tooltip={cardAction.tooltip}
              className={cardAction.className ?? DEFAULT_ACTION_CLASS}
              onClick={cardAction.onClick}
              disabled={cardAction.disabled}
              isActive={cardAction.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
};