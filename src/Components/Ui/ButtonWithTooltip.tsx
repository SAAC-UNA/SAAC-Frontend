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

import React from 'react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/index';
import type { ComponentSize } from '@/constants/ComponentSizes';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'transparent' | 'success' | 'tableView' | 'tableEdit' | 'tableDelete';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface ButtonWithTooltipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
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
  variant = 'primary',
  size = 'sm',
  tooltip,
  tooltipPosition = 'top',
  isLoading = false,
  fullWidth = false,
  flex = false,
  responsive = false,
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          isLoading={isLoading}
          fullWidth={fullWidth}
          flex={flex}
          responsive={responsive}
          className={className}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipPosition}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};