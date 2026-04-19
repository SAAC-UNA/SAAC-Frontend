import React, { forwardRef, useId } from 'react';
import { cn } from '@/Utils/ClassNames';
import { type ComponentSize } from '@/constants/ComponentSizes';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled' | 'floating';
  size?: ComponentSize;
  required?: boolean;
  onValidateChange?: (value: string, error?: string) => void;
  validateOnChange?: boolean;
  characterCount?: boolean;
  maxLength?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'floating', // Cambiar default a floating
  size = 'sm',
  required = false,
  className,
  id,
  value, // Asegurar que tenemos acceso al value
  placeholder, // Extraer placeholder por separado
  onValidateChange,
  validateOnChange = false,
  characterCount = false,
  maxLength,
  onChange,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Función para manejar cambios con validación en tiempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Respeta el maxLength si está definido
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    // Ejecuta onChange original si existe
    onChange?.(e);
    
    // Ejecuta validación en tiempo real si está habilitada
    if (validateOnChange && onValidateChange) {
      onValidateChange(newValue);
    }
  };

  // Generar helperText dinámico con contador de caracteres
  const getHelperText = () => {
    if (characterCount && value) {
      const currentLength = value.toString().length;
      const counter = maxLength ? `${currentLength}/${maxLength} caracteres` : `${currentLength} caracteres`;
      return helperText ? `${helperText} (${counter})` : counter;
    }
    return helperText;
  };

  // Floating label variant (nuevo diseño por defecto)
  if (variant === 'floating') {
    // Detectar si el input tiene contenido
    const hasValue = Boolean(value && value.toString().trim() !== '');

    return (
      <div className="space-y-2">
        <div className="relative">
          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            className={cn(
              // Base styles - Similar al login de tu compañera
              `w-full h-10 px-4 ${TYPOGRAPHY.form.input} border rounded-corner transition-all duration-300`,
              'focus:outline-none focus:border-gris-una',
              'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
              'peer', // Para usar peer selectors de Tailwind
              
              // Placeholder condicional - solo visible en focus (más pequeño)
              'placeholder-transparent focus:placeholder-gris-una/60 placeholder:text-sm', // Placeholder más pequeño
              
              // State variants
              error
                ? 'border-error' 
                : 'border-gris-light bg-blanco-una',
              
              // Custom classes
              className
            )}
            // Placeholder que se muestra solo en focus
            placeholder={placeholder || ""}
            onChange={handleChange}
            // Ya no necesitamos los data attributes
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <label 
              htmlFor={inputId}
              className={cn(
                // Base floating label styles - Inspirado en el login
                'absolute left-4 transition-all duration-300 pointer-events-none',
                'transform',
                
                // Tamaño del texto del label (más pequeño)
                TYPOGRAPHY.form.label,
                
                // Posicionamiento dinámico basado en focus o contenido
                hasValue 
                  ? 'top-0 scale-75 -translate-y-1/2' // Label arriba cuando hay contenido (scale-75 lo hará aún más pequeño)
                  : 'top-1/2 scale-100 -translate-y-1/2', // Label centrado cuando está vacío
                
                // Comportamiento con focus (peer selectors como fallback)
                'peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2',
                'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-1/2',
                
                // Halo de texto: simula fondo sin recuadro sólido sobre el borde del input
                'bg-transparent px-1 floating-label-halo',
                
                // Colors
                error
                  ? 'text-error'
                  : hasValue 
                    ? 'text-gris-una font-semibold'  // Color activo cuando tiene contenido
                    : 'text-gris-una peer-focus:text-gris-una peer-focus:font-semibold',
              )}
            >
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className={`text-error ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
            <SystemIcons.interface.alert className="w-4 h-4 shrink-0 text-error" size="sm" />
            {error}
          </p>
        )}

        {/* Helper text */}
        {getHelperText() && !error && (
          <p className={`text-gris-una ${TYPOGRAPHY.form.helper}`}>
            {getHelperText()}
          </p>
        )}
      </div>
    );
  }

  // Variante tradicional (para compatibilidad)
  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block ${TYPOGRAPHY.form.label} font-medium text-negro-una`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        ref={ref}
        id={inputId}
        maxLength={maxLength}
        className={cn(
          // Base styles
          `w-full h-10 border rounded-corner transition-all duration-200 px-3 py-2 ${TYPOGRAPHY.form.input}`,
          'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
          'placeholder-gris-una/60 disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          
          // State variants
          error
            ? 'border-rojo-una-2/5 bg-rojo-una-2/2' 
            : 'border-gris-una/5 bg-gris-una/10',
          
          // Custom classes
          className
        )}
        onChange={handleChange}
        {...props}
      />

      {/* Error message */}
      {error && (
        <p className={`text-error ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
          <SystemIcons.interface.alert className="w-4 h-4 shrink-0 text-error" size="sm" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {getHelperText() && !error && (
        <p className={`text-gris-una ${TYPOGRAPHY.form.helper}`}>
          {getHelperText()}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';