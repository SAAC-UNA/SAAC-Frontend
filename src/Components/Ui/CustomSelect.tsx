import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../Utils/ClassNames';
import { type ComponentSize } from '../../Constants/ComponentSizes';
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
  size?: ComponentSize;
  disabled?: boolean;
  error?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  placeholder = 'Seleccionar...',
  options,
  size = 'sm', // Cambiar default a sm para consistencia con otros formularios
  disabled = false,
  error,
  className,
  onChange
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

  const getLabelSizeClasses = () => {
    return 'text-sm'; // Usar siempre el mismo tamaño de label para consistencia
  };

  return (
    <div className={cn('relative w-full', className)} ref={selectRef}>
      {/* Label - Solo renderizar si hay label */}
      {label && (
        <label className={cn(
          'block font-medium text-negro-una mb-1',
          getLabelSizeClasses(),
          disabled && 'text-gray-400'
        )}>
          {label}
          {/* Note: removed required prop since CustomSelect doesn't have it, but we could add it if needed */}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        className={cn(
          'relative w-full h-10 border rounded-lg text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent transition-all duration-200',
          'placeholder-gris-una/60 disabled:cursor-not-allowed px-3 py-2 text-sm',
          disabled
            ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
            : error
            ? 'border-rojo-una-2/5 bg-rojo-una-2/2'
            : 'border-gris-una/5 bg-gris-una/10 hover:border-gris-una/10',
          isOpen && !disabled && 'border-gris-una/20'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(
          'block truncate',
          !selectedOption && 'text-gris-una/60'
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

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto custom-scrollbar">
          <div className={cn('py-1', getDropdownSizeClasses())}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'relative w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150',
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-900 cursor-pointer',
                  selectedOption?.value === option.value && 'bg-blue-50 text-blue-900 font-medium'
                )}
                onClick={() => handleOptionSelect(option)}
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