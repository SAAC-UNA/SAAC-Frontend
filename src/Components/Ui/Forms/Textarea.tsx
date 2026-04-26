import React, { forwardRef, useId } from 'react';
import { cn } from '@/Utils/ClassNames';
import { type ComponentSize } from '@/constants/ComponentSizes';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating';
  size?: ComponentSize;
  required?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'; // Mantenemos el tipo por compatibilidad, pero siempre será 'none'
  onValidateChange?: (value: string, error?: string) => void;
  validateOnChange?: boolean;
  characterCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'floating', // Cambiar default a floating para consistencia con Input
  size = 'sm', // Cambiar default a sm para consistencia
  resize = 'none', // Deshabilitar resize por defecto
  required = false,
  className,
  id,
  rows = 4,
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
  const textareaId = id || generatedId;
  const characterCountText = characterCount
    ? `${value ? value.toString().length : 0}${maxLength ? `/${maxLength}` : ''} caracteres`
    : '';

  // Función para manejar cambios con validación en tiempo real
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  // Floating label variant (nuevo diseño por defecto, igual al Input)
  if (variant === 'floating') {
    // Detectar si el textarea tiene contenido
    const hasValue = Boolean(value && value.toString().trim() !== '');

    return (
      <div className="space-y-1">
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              // Base styles - Similar al Input actualizado
              `w-full px-4 py-3 ${TYPOGRAPHY.form.input} border rounded-corner transition-all duration-300`,
              'focus:outline-none focus:border-gris-una',
              'disabled:bg-blanco-una-2 disabled:cursor-not-allowed',
              'peer', // Para usar peer selectors de Tailwind
              
              // Placeholder condicional - solo visible en focus (igual al Input)
              'placeholder-transparent focus:placeholder-gris-una/60 placeholder:text-sm',
              
              // Forzar resize-none siempre para evitar redimensionamiento
              '!resize-none',
              
              // State variants - mismo estilo que Input
              error
                ? 'border-rojo-una-2' 
                : 'border-gris-light bg-blanco-una',
              
              // Custom classes
              className
            )}
            // Placeholder que se muestra solo en focus
            placeholder={placeholder || ""}
            onChange={handleChange}
            {...props}
          />

          {characterCount && (
            <span
              className={cn(
                'absolute right-3 bottom-0 z-[2] translate-y-1/2 scale-75 origin-right px-1 floating-label-halo',
                TYPOGRAPHY.form.label,
                error ? 'text-rojo-una-2' : 'text-gris-una',
              )}
            >
              {characterCountText}
            </span>
          )}

          {/* Floating Label */}
          {label && (
            <label 
              htmlFor={textareaId}
              className={cn(
                // Base floating label styles - Igual al Input
                'absolute left-4 transition-all duration-300 pointer-events-none',
                'transform',
                
                // Tamaño del texto del label (más pequeño)
                TYPOGRAPHY.form.label,
                
                // Posicionamiento dinámico basado en focus o contenido
                hasValue 
                  ? 'top-0 scale-75 -translate-y-1/2' // Label arriba cuando hay contenido
                  : 'top-6 scale-100 -translate-y-1/2', // Label un poco más abajo que Input por el padding del textarea
                
                // Comportamiento con focus (peer selectors como fallback)
                'peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2',
                'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-1/2',
                
                // Halo de texto: simula fondo sin recuadro sólido sobre el borde del input
                'bg-transparent px-1 floating-label-halo',
                
                // Colors - igual al Input
                error
                  ? 'text-rojo-una-2'
                  : hasValue 
                    ? 'text-gris-una font-semibold'  // Color activo cuando tiene contenido
                    : 'text-gris-una peer-focus:text-gris-una peer-focus:font-semibold',
              )}
            >
              {label}
              {required && <span className="text-rojo-una-2 ml-1">*</span>}
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
            <SystemIcons.interface.alert className="w-4 h-4 flex-shrink-0 text-rojo-una-2" size="sm" />
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <div className={`flex items-center ${TYPOGRAPHY.form.helper} text-gris-una`}>
            <span className="flex-1">{helperText}</span>
          </div>
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
          htmlFor={textareaId}
          className={`block ${TYPOGRAPHY.form.label} font-medium text-negro-una`}
        >
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            // Base styles actualizados para consistencia con Input
            `w-full border rounded-corner transition-all duration-300 px-4 py-3 ${TYPOGRAPHY.form.input}`,
            'focus:outline-none focus:border-gris-una',
            'placeholder-gris-una/60 disabled:bg-gris-una/10 disabled:cursor-not-allowed',
            
            // Forzar resize-none siempre para evitar redimensionamiento
            '!resize-none',
            
            // State variants - actualizados para consistencia con Input
            error 
              ? 'border-rojo-una-2' 
              : 'border-gris-una bg-blanco-una-2',
            
            // Custom classes
            className
          )}
          onChange={handleChange}
          {...props}
        />

        {characterCount && (
          <span
            className={cn(
              'absolute right-3 bottom-0 translate-y-1/2 scale-75 origin-right px-1 floating-label-halo',
              TYPOGRAPHY.form.label,
              error ? 'text-rojo-una-2' : 'text-gris-una',
            )}
          >
            {characterCountText}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
          <SystemIcons.interface.alert className="w-4 h-4 flex-shrink-0 text-rojo-una-2" size="sm" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <div className={`flex items-center ${TYPOGRAPHY.form.helper} text-gris-una`}>
          <span className="flex-1">{helperText}</span>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
