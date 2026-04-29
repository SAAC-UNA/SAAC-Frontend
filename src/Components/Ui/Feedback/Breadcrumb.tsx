import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/Utils/ClassNames";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/Ui/Feedback/Tooltip";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  tooltip?: string;
  onClick?: () => void | Promise<void>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "default" | "table" | "child";
}

const ChevronSeparator = () => (
  <SystemIcons.interface.chevronBreadcrumb className="text-gris-una" size="sm" />
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, variant = "default" }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
        <ol className={cn(
          "flex flex-wrap items-center gap-1 text-gris-una",
          variant === "child" ? TYPOGRAPHY.table.helper
          : variant === "table" ? TYPOGRAPHY.table.helper
          : "text-xs",
        )}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;
            const showSeparator = index > 0;
            const labelClassName = cn(
              "block truncate transition-colors",
              isCurrent
                ? variant === "child" ? "text-gris-una-2"
                  : variant === "table" ? "font-semibold text-negro-una-2"
                  : "font-semibold text-negro-una"
                : (variant === "table" || variant === "child") ? "font-semibold text-negro-una-2" : "hover:text-negro-una",
            );

            const content = item.href ? (
              <Link
                to={item.href}
                onClick={item.onClick}
                className={labelClassName}
              >
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className={cn(labelClassName, "cursor-pointer text-left")}
              >
                {item.label}
              </button>
            ) : (
              <span className={labelClassName}>{item.label}</span>
            );

            const wrappedContent = item.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex min-w-0 cursor-help">
                    {content}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="w-max max-w-[85vw] whitespace-normal wrap-break-word text-left"
                >
                  {item.tooltip}
                </TooltipContent>
              </Tooltip>
            ) : (
              content
            );

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-1 min-w-0"
              >
                {showSeparator && <ChevronSeparator />}
                {wrappedContent}
              </li>
            );
          })}
        </ol>
      </nav>
    </TooltipProvider>
  );
};
