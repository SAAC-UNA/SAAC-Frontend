import React from 'react';
import { cn } from '@/utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/constants/ComponentSizes';
import { Button } from '@/components/Ui/Index';
import infoTriangleIcon from '@/assets/Icons/info-triangle.svg';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  label?: string;
  error?: string | string[];
  helperText?: string;
  options: Option[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  required?: boolean;
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl';
  showCounter?: boolean;
  size?: ComponentSize;
}

const maxHeightClasses = {
  sm: 'max-h-32',   // 8rem
  md: 'max-h-48',   // 12rem  
  lg: 'max-h-64',   // 16rem
  xl: 'max-h-80'    // 20rem
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  helperText,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecciona opciones...",
  required = false,
  maxHeight = 'lg',
  showCounter = true,
  size = 'md'
}) => {
  const multiSelectId = `multiselect-${Math.random().toString(36).substr(2, 9)}`;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  const handleToggle = (optionId: string) => {
    const isSelected = selectedValues.includes(optionId);
    const newSelectedValues = isSelected
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    
    onChange(newSelectedValues);
  };

  const handleSelectAll = () => {
    const allSelected = selectedValues.length === options.length;
    onChange(allSelected ? [] : options.map(option => option.id));
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label 
            htmlFor={multiSelectId}
            className="block text-sm font-medium text-negro-una"
          >
            {label}
            {required && <span className="text-rojo-una-2 ml-1">*</span>}
          </label>
          
          {/* Select All / Deselect All */}
          <Button
            type="button"
            variant="transparent"
            onClick={handleSelectAll}
            className="text-xs"
          >
            {selectedValues.length === options.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
        </div>
      )}

      {/* Options Container */}
      <div 
        id={multiSelectId}
        className={cn(
          'border rounded-lg overflow-y-auto custom-scrollbar',
          getComponentSizeClasses.input(size),
          maxHeightClasses[maxHeight],
          errorMessage 
            ? 'border-rojo-una-2/5 bg-rojo-una-2/2' 
            : 'border-gris-una/5 bg-gris-una/10'
        )}
      >
        {options.length === 0 ? (
          <div className="text-center py-8 text-gris-una">
            <p className="text-sm">{placeholder}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.id);
              
              return (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-start gap-3 p-2 rounded-md cursor-pointer transition-all duration-200',
                    'hover:bg-gris-una/7',
                    isSelected && 'bg-blanco-una-2'
                  )}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.id)}
                    className="w-4 h-4 mt-0.5 text-rojo-una-2 border-gris-una/30 rounded "
                  />
                  
                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-negro-una">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gris-una mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <p className="text-rojo-una-2 text-sm flex items-center gap-2">
          <img 
            src={infoTriangleIcon} 
            alt="Error" 
            className="w-4 h-4 flex-shrink-0 icon-rojo-una-2"
          />
          {errorMessage}
        </p>
      )}

      {/* Helper text & Counter */}
      <div className="flex items-center justify-between">
        {helperText && !errorMessage && (
          <p className="text-gris-una text-sm">
            {helperText}
          </p>
        )}
        
        {showCounter && (
          <p className="text-xs text-gris-una">
            {selectedValues.length} de {options.length} seleccionado(s)
          </p>
        )}
      </div>
    </div>
  );
};