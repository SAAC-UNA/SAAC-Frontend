import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/Utils/ClassNames";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/Ui/Feedback/Tooltip";

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
}

const ChevronSeparator = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="size-4 text-gris-una"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gris-una">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;
            const showSeparator = index > 0;
            const labelClassName = cn(
              "block truncate transition-colors",
              isCurrent
                ? "font-semibold text-negro-una"
                : "hover:text-negro-una",
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
