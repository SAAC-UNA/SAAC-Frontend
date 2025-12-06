/**
 * FilterButton - Botón de filtro con dropdown
 * 
 * Solo muestra un ícono de filtro con tooltip. Al hacer click despliega opciones.
 * Cuando se selecciona algo diferente al default, muestra un badge con la opción seleccionada.
 */

import { useState, useRef, useEffect } from 'react';
import { SystemIcons } from './Icons/SystemIcons';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { cn } from '@/Utils/ClassNames';

export interface FilterOption<T = string> {
  value: T;
  label: string;
}

export interface FilterButtonProps<T = string> {
  /** Texto del tooltip */
  tooltipText: string;
  /** Opciones de filtrado disponibles */
  options: FilterOption<T>[];
  /** Valor seleccionado actualmente */
  value: T;
  /** Callback cuando se selecciona una opción */
  onChange: (value: T) => void;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Deshabilitar el filtro */
  disabled?: boolean;
}

export function FilterButton<T = string>({
  tooltipText,
  options,
  value,
  onChange,
  className,
  disabled = false
}: FilterButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const hasActiveFilter = value !== options[0]?.value; // Asume que la primera opción es "Todos" o default

  return (
    <div ref={dropdownRef} className={cn("relative inline-flex items-center gap-2", className)}>
      {/* Ícono con tooltip */}
      <Tooltip>
        <TooltipTrigger>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "p-2 rounded-lg",
              "border border-gray-300 bg-white",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-azul-una",
              "transition-colors duration-150",
              disabled && "opacity-50 cursor-not-allowed",
              hasActiveFilter && "border-azul-una bg-azul-una/5"
            )}
          >
            <div className="text-gris-una">
              <SystemIcons.interface.filter size="md" color="currentColor" />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {tooltipText}
        </TooltipContent>
      </Tooltip>

      {/* Badge de filtro activo */}
      {hasActiveFilter && selectedOption && (
        <span className="text-xs px-2 py-1 rounded-full bg-azul-una text-white font-medium whitespace-nowrap">
          {selectedOption.label}
        </span>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-300 overflow-hidden z-50">
          <div className="py-1 overflow-auto custom-scrollbar" style={{ maxHeight: '240px' }}>
            {options.map((option) => {
              const isSelected = option.value === value;
              
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative w-full text-left px-4 py-2 text-sm text-gray-900",
                    "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                    "transition-colors duration-150 cursor-pointer",
                    isSelected && "bg-blue-50 text-blue-900 font-medium"
                  )}
                  role="menuitem"
                >
                  {option.label}
                  
                  {/* Check icon para opción seleccionada - mismo diseño que SingleSelect */}
                  {isSelected && (
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterButton;
