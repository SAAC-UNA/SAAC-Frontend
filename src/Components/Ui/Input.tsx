import React, { forwardRef } from 'react';
import { cn } from '@/utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/constants/ComponentSizes';
import infoTriangleIcon from '@/assets/Icons/info-triangle.svg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: ComponentSize;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  required = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-negro-una"
        >
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          // Base styles
          'w-full border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
          'placeholder-gris-una/60 disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          
          // Size variants
          getComponentSizeClasses.input(size),
          
          // State variants
          error
            ? 'border-rojo-una-2/5 bg-rojo-una-2/2' 
            : 'border-gris-una/5 bg-gris-una/10',
          
          // Custom classes
          className
        )}
        {...props}
      />

      {/* Error message */}
      {error && (
        <p className="text-rojo-una-2 text-sm flex items-center gap-2">
          <img 
            src={infoTriangleIcon} 
            alt="Error" 
            className="w-4 h-4 flex-shrink-0 icon-rojo-una-2"
          />
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-gris-una text-sm">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';