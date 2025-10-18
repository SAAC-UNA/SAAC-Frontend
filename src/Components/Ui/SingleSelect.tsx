/**
 * CustomSelect - Componente de selección principal
 * 
 * Este es el componente recomendado para todas las selecciones.
 * Proporciona una mejor UX que el select nativo con diseño consistente.
 * 
 * Features:
 * - Floating labels por defecto
 * - Búsqueda/filtrado (puede expandirse)
 * - Diseño consistente con el sistema
 * - Mejor accesibilidad
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/Utils/ClassNames';
import { type ComponentSize } from '@/Constants/ComponentSizes';
import { SystemIcons } from './Icons/SystemIcons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  variant?: 'default' | 'floating';
  size?: ComponentSize;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  // Modo readonly - solo mostrar información, no permitir selección
  readonly?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  placeholder = 'Seleccionar...',
  options,
  variant = 'floating', // Default a floating para consistencia
  size = 'sm', // Cambiar default a sm para consistencia con otros formularios
  disabled = false,
  error,
  className,
  required = false,
  onChange,
  readonly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    value ? options.find(opt => opt.value === value) || null : null
  );
  const selectRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar opción seleccionada cuando cambia el value prop
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option.value);
  };

  const getDropdownSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1 text-sm';
      case 'lg':
        return 'py-2 text-lg';
      default:
        return 'py-1 text-base';
    }
  };

  // Floating label variant (nuevo diseño por defecto)
  if (variant === 'floating') {
    // Detectar si tiene contenido seleccionado
    const hasValue = Boolean(selectedOption);
    const selectId = `customselect-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('relative w-full space-y-2', className)} ref={selectRef}>
        <div className="relative">
          {/* Select Button */}
          <button
            type="button"
            id={selectId}
            className={cn(
              // Base styles - Similar al Input actualizado
              'relative w-full px-4 py-3 text-sm border rounded-lg text-left cursor-pointer transition-all duration-300',
              'focus:outline-none focus:border-gris-una',
              'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
              'peer', // Para usar peer selectors de Tailwind
              
              // Readonly styles - comportamiento de solo lectura
              readonly && 'cursor-default',
              
              // State variants - mismo estilo que Input
              error
                ? 'border-rojo-una-2' 
                : 'border-gris-una bg-blanco-una-2',
              
              disabled
                ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
                : isOpen && !readonly && 'border-gris-una/20'
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn(
              'block truncate',
              !selectedOption && 'text-transparent' // Ocultar cuando no hay selección para que no choque con label
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            {/* Arrow Icon */}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className={cn(
                  'w-5 h-5 text-gris-una transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>

          {/* Floating Label */}
          {label && (
            <label 
              htmlFor={selectId}
              className={cn(
                // Base floating label styles - Igual al Input
                'absolute left-4 transition-all duration-300 pointer-events-none',
                'transform',
                
                // Tamaño del texto del label (más pequeño)
                'text-sm', // Label más pequeño
                
                // Posicionamiento dinámico basado en focus o contenido
                hasValue || isOpen
                  ? 'top-0 scale-75 -translate-y-1/2' // Label arriba cuando hay contenido o está abierto
                  : 'top-1/2 scale-100 -translate-y-1/2', // Label centrado cuando está vacío
                
                // Comportamiento con focus (peer selectors como fallback)
                'peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2',
                
                // Fondo condicional: blanco solo cuando está arriba (igual al Input)
                hasValue || isOpen
                  ? 'bg-blanco-una-2 px-2' // Fondo blanco cuando tiene contenido (label arriba)
                  : 'bg-transparent px-1', // Transparente cuando está centrado
                
                // Fondo blanco también con focus (peer selectors)
                'peer-focus:bg-blanco-una-2 peer-focus:px-2',
                
                // Colors - igual al Input
                error
                  ? 'text-rojo-una-2'
                  : hasValue || isOpen
                    ? 'text-gris-una font-semibold'  // Color activo cuando tiene contenido
                    : 'text-gris-una peer-focus:text-gris-una peer-focus:font-semibold',
              )}
            >
              {label}
              {required && <span className="text-rojo-una-2 ml-1">*</span>}
            </label>
          )}
        </div>

        {/* Dropdown */}
        {/* Allow showing dropdown in readonly mode (view-only) */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[120px] overflow-auto custom-scrollbar">
            <div className={cn('py-1', getDropdownSizeClasses())}>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'relative w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150',
                    option.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : readonly
                        ? 'text-gray-900 cursor-default'
                        : 'text-gray-900 cursor-pointer',
                    selectedOption?.value === option.value && 'bg-blue-50 text-blue-900 font-medium'
                  )}
                  onClick={() => !readonly && handleOptionSelect(option)}
                  disabled={option.disabled}
                >
                  {option.label}
                  
                  {/* Check icon for selected option */}
                  {selectedOption?.value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-rojo-una-2 text-sm flex items-center gap-2">
            <SystemIcons.interface.alert className="w-4 h-4 flex-shrink-0 text-rojo-una-2" size="sm" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Variante tradicional (para compatibilidad)
  return (
    <div className={cn('relative w-full', className)} ref={selectRef}>
      {/* Label - Solo renderizar si hay label */}
      {label && (
        <label className={cn(
          'block font-medium text-sm mb-2', // Actualizado para consistencia
          disabled ? 'text-gray-400' : 'text-negro-una'
        )}>
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        className={cn(
          // Base styles actualizados para consistencia con Input
          'relative w-full border rounded-lg text-left cursor-pointer transition-all duration-300 px-4 py-3 text-sm',
          'focus:outline-none focus:border-gris-una',
          'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          
          // Readonly styles
          readonly && 'cursor-default',
          
          // State variants - actualizados para consistencia con Input
          disabled
            ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
            : error
            ? 'border-rojo-una-2' 
            : 'border-gris-una bg-blanco-una-2 hover:border-gris-una/50',
          isOpen && !disabled && !readonly && 'border-gris-una/20'
        )}
        onClick={() => !disabled && !readonly && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(
          'block truncate',
          !selectedOption && 'text-gris-una/60'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Arrow Icon */}
        {!readonly && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={cn(
                'w-5 h-5 text-gris-una transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {/* Allow showing dropdown in readonly mode (view-only) */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[120px] overflow-auto custom-scrollbar">
          <div className={cn('py-1', getDropdownSizeClasses())}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'relative w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150',
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : readonly
                      ? 'text-gray-900 cursor-default'
                      : 'text-gray-900 cursor-pointer',
                  selectedOption?.value === option.value && 'bg-blue-50 text-blue-900 font-medium'
                )}
                onClick={() => !readonly && handleOptionSelect(option)}
                disabled={option.disabled}
              >
                {option.label}
                
                {/* Check icon for selected option */}
                {selectedOption?.value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-rojo-una-2 text-sm flex items-center gap-2">
          <SystemIcons.interface.alert className="w-4 h-4 flex-shrink-0 text-rojo-una-2" size="sm" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;