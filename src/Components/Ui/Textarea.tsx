import React, { forwardRef } from 'react';
import { cn } from '@/utils/ClassNames';
import { type ComponentSize } from '@/constants/ComponentSizes';
import { SystemIcons } from './Icons/SystemIcons';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: ComponentSize;
  required?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const RESIZE_CLASSES = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize'
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  size = 'sm', // Cambiar default a sm para consistencia
  resize = 'vertical',
  required = false,
  className,
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-negro-una"
        >
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          // Base styles
          'w-full border rounded-lg transition-all duration-200 px-3 py-2 text-sm',
          'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
          'placeholder-gris-una/60 disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          
          // Resize behavior
          RESIZE_CLASSES[resize],
          
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
          <SystemIcons.interface.alert className="w-4 h-4 flex-shrink-0 text-rojo-una-2" size="sm" />
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

Textarea.displayName = 'Textarea';