import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/ClassNames';
import { SystemIcons } from './Icons/SystemIcons';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  value?: string[];
  placeholder?: string;
  options: MultiSelectOption[];
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  showSelectAll?: boolean;
  selectAllText?: string;
  deselectAllText?: string;
  onChange?: (values: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value = [],
  placeholder = 'Seleccionar...',
  options,
  disabled = false,
  error,
  className,
  required = false,
  showSelectAll = true,
  selectAllText = 'Seleccionar todo',
  deselectAllText = 'Deseleccionar todo',
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    value ? options.filter(opt => value.includes(opt.value)) : []
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

  // Actualizar opciones seleccionadas cuando cambia el value prop
  useEffect(() => {
    if (value) {
      const newSelectedOptions = options.filter(opt => value.includes(opt.value));
      setSelectedOptions(newSelectedOptions);
    } else {
      setSelectedOptions([]);
    }
  }, [value, options]);

  const handleOptionToggle = (option: MultiSelectOption) => {
    if (option.disabled || disabled) return;
    
    let newSelectedOptions: MultiSelectOption[];
    const isSelected = selectedOptions.some(selected => selected.value === option.value);
    
    if (isSelected) {
      // Remover opción
      newSelectedOptions = selectedOptions.filter(selected => selected.value !== option.value);
    } else {
      // Agregar opción
      newSelectedOptions = [...selectedOptions, option];
    }
    
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions.map(opt => opt.value));
  };

  const handleSelectAll = () => {
    const enabledOptions = options.filter(opt => !opt.disabled);
    const allSelected = enabledOptions.every(opt => selectedOptions.some(selected => selected.value === opt.value));
    
    if (allSelected) {
      // Deseleccionar todo
      const newSelectedOptions = selectedOptions.filter(selected => 
        !enabledOptions.some(enabled => enabled.value === selected.value)
      );
      setSelectedOptions(newSelectedOptions);
      onChange?.(newSelectedOptions.map(opt => opt.value));
    } else {
      // Seleccionar todo
      const newSelectedOptions = [...selectedOptions];
      enabledOptions.forEach(opt => {
        if (!newSelectedOptions.some(selected => selected.value === opt.value)) {
          newSelectedOptions.push(opt);
        }
      });
      setSelectedOptions(newSelectedOptions);
      onChange?.(newSelectedOptions.map(opt => opt.value));
    }
  };

  const isAllSelected = () => {
    const enabledOptions = options.filter(opt => !opt.disabled);
    return enabledOptions.length > 0 && enabledOptions.every(opt => 
      selectedOptions.some(selected => selected.value === opt.value)
    );
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} elementos seleccionados`;
  };

  return (
    <div className={cn('relative w-full', className)} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className={cn(
          'block font-medium text-negro-una text-sm mb-1',
          disabled && 'text-gray-400'
        )}>
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
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
          selectedOptions.length === 0 && 'text-gris-una/60'
        )}>
          {getDisplayText()}
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[140px] overflow-auto custom-scrollbar">
          <div className="py-1 text-sm">
            {/* Botón Seleccionar todo dentro del dropdown */}
            {showSelectAll && options.length > 1 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="w-full text-left px-4 py-2.5 text-azul-una hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-200 bg-gray-50/50"
              >
                <span className="font-semibold text-sm">
                  {isAllSelected() ? deselectAllText : selectAllText}
                </span>
              </button>
            )}
            
            {options.map((option) => {
              const isSelected = selectedOptions.some(selected => selected.value === option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'relative w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150 flex items-center justify-between',
                    option.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-900 cursor-pointer',
                    isSelected && 'bg-blue-50 text-blue-900 font-medium'
                  )}
                  onClick={() => handleOptionToggle(option)}
                  disabled={option.disabled}
                >
                  <span className="flex-1">{option.label}</span>
                  
                  {/* Check icon for selected options */}
                  {isSelected && (
                    <span className="flex-shrink-0 ml-2">
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