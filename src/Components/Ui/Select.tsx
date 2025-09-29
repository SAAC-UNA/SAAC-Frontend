import React, { forwardRef } from 'react';
import { cn } from '@/Utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/Constants/ComponentSizes';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: ComponentSize;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  required = false,
  options,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-negro-una"
        >
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      {/* Select */}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          // Base styles
          'w-full border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
          'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          
          // Size classes
          getComponentSizeClasses.input(size),
          
          // Variant styles
          variant === 'default' && [
            'border-gris-una/30',
            error ? 'border-rojo-una-2 bg-rojo-una-2/5' : 'hover:border-gris-una/50'
          ],
          variant === 'outline' && [
            'border-2 border-azul-una',
            error ? 'border-rojo-una-2' : 'focus:border-azul-una'
          ],
          variant === 'filled' && [
            'bg-gris-una/10 border-transparent',
            error ? 'bg-rojo-una-2/5 border-rojo-una-2' : 'focus:bg-white focus:border-gris-una/30'
          ],
          
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {error && (
        <p className="text-sm text-rojo-una-2">
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gris-una">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
