import React from "react";
import { cn } from "@/Utils/ClassNames";

interface StatusBadgeProps {
  label: string;
  colorClasses: string;
  badgeClassName?: string;
  /** 'md' (default, 12px) | 'sm' (10px, para tarjetas y espacios reducidos) */
  size?: "md" | "sm";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  colorClasses,
  badgeClassName,
  size = "md",
}) => {
  const sizeClasses =
    size === "sm" ? "px-1 py-0.5 text-[0.7rem]" : "px-1.5 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex w-max select-none items-center justify-center whitespace-nowrap rounded-full border font-medium leading-none",
        sizeClasses,
        colorClasses,
        badgeClassName,
      )}
    >
      {label}
    </span>
  );
};
