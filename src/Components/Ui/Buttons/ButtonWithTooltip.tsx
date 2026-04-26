/**
 * ButtonWithTooltip - Wrapper que combina Button con Tooltip de forma simple
 *
 * Este componente simplifica el uso de botones con tooltips, especialmente
 * útil para botones de tabla que necesitan explicar su función.
 *
 * Uso:
 * <ButtonWithTooltip
 *   variant="tableView"
 *   tooltip="Ver permisos"
 *   onClick={handleClick}
 * >
 *   <Icon />
 * </ButtonWithTooltip>
 */

import React from "react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/Ui/Index";
import type { ComponentSize } from "@/constants/ComponentSizes";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "transparent"
  | "success"
  | "tableView"
  | "tableEdit"
  | "tableDelete"
  | "tablePower"
  | "tablePowerInactive";
type TooltipPosition = "top" | "bottom" | "left" | "right";

interface ButtonWithTooltipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  tooltip: string;
  tooltipPosition?: TooltipPosition;
  isLoading?: boolean;
  fullWidth?: boolean;
  flex?: boolean;
  responsive?: boolean;
  children: React.ReactNode;
}

export const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  variant = "primary",
  size = "sm",
  tooltip,
  tooltipPosition = "top",
  isLoading = false,
  fullWidth = false,
  flex = false,
  responsive = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const buttonElement = (
    <Button
      variant={variant}
      size={size}
      isLoading={isLoading}
      fullWidth={fullWidth}
      flex={flex}
      responsive={responsive}
      className={className}
      disabled={disabled}
      style={disabled ? { pointerEvents: "none" } : undefined}
      {...props}
    >
      {children}
    </Button>
  );

  return (
    <Tooltip>
      {disabled ? (
        <TooltipTrigger>
          <span style={{ pointerEvents: "auto", display: "inline-flex" }}>
            {buttonElement}
          </span>
        </TooltipTrigger>
      ) : (
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
      )}
      <TooltipContent side={tooltipPosition}>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
