import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/Utils/ClassNames';
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
  variant?: 'default' | 'floating';
  showSelectAll?: boolean;
  selectAllText?: string;
  deselectAllText?: string;
  maxVisibleItems?: number; // Número máximo de items visibles antes de scroll
  id?: string;
  onChange?: (values: string[]) => void;
  // Búsqueda/Filtrado
  searchable?: boolean; // Habilitar búsqueda en el dropdown
  searchPlaceholder?: string; // Placeholder del campo de búsqueda
  minItemsForSearch?: number; // Número mínimo de items para mostrar búsqueda (default: 5)
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
  variant = 'floating', // Default a floating para consistencia
  showSelectAll = true,
  selectAllText = 'Seleccionar todo',
  deselectAllText = 'Deseleccionar todo',
  maxVisibleItems = 5, // Por defecto mostrar 3 items (140px ≈ 3 items de ~46px cada uno)
  id,
  onChange,
  searchable = true, // Habilitado por defecto
  searchPlaceholder = 'Buscar...',
  minItemsForSearch = 5 // Mostrar búsqueda si hay 5 o más items
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(
    value ? options.filter(opt => value.includes(opt.value)) : []
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Calcular altura máxima basada en el número de items visibles
  // Cada item tiene aproximadamente 46px de altura (incluyendo padding y border)
  const getMaxHeight = () => {
    const itemHeight = 46; // Altura aproximada de cada item
    const maxHeight = maxVisibleItems * itemHeight;
    return `${maxHeight}px`;
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Limpiar búsqueda al cerrar
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus en el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && searchable && options.length >= minItemsForSearch && searchInputRef.current) {
      // Pequeño delay para asegurar que el dropdown esté renderizado
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable, options.length, minItemsForSearch]);

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

  // Filtrar opciones según el término de búsqueda
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return options.filter(option => 
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  }, [options, searchTerm]);

  // Determinar si se debe mostrar el campo de búsqueda
  const showSearch = searchable && options.length >= minItemsForSearch;

  // Floating label variant (nuevo diseño por defecto)
  if (variant === 'floating') {
    // Detectar si tiene contenido seleccionado
    const hasValue = selectedOptions.length > 0;

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
              
              // State variants - mismo estilo que Input
              error
                ? 'border-rojo-una-2' 
                : 'border-gris-una bg-blanco-una-2',
              
              disabled
                ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
                : isOpen && 'border-gris-una/20'
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn(
              'block truncate',
              selectedOptions.length === 0 && 'text-transparent' // Ocultar cuando no hay selección para que no choque con label
            )}>
              {hasValue ? getDisplayText() : placeholder}
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
        {isOpen && !disabled && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Campo de búsqueda (si está habilitado y hay suficientes items) */}
            {showSearch && (
              <div className="p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
                <div className="relative">
                  <SystemIcons.interface.search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-una w-4 h-4" 
                    size="sm" 
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-azul-una focus:ring-1 focus:ring-azul-una"
                    onClick={(e) => e.stopPropagation()} // Evitar que cierre el dropdown
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gris-una hover:text-negro-una p-1"
                    >
                      <SystemIcons.interface.closeCircle className="w-4 h-4" size="sm" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div 
              className="overflow-auto custom-scrollbar"
              style={{ maxHeight: getMaxHeight() }}
            >
              <div className="py-1 text-sm">
                {/* Botón Seleccionar todo dentro del dropdown */}
                {showSelectAll && filteredOptions.length > 1 && (
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
                
                {/* Mensaje cuando no hay resultados */}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-8 text-center text-gris-una">
                    <SystemIcons.interface.search className="w-8 h-8 mx-auto mb-2 opacity-50" size="md" />
                    <p className="text-sm">No se encontraron resultados</p>
                    {searchTerm && (
                      <p className="text-xs mt-1">
                        Intenta con otro término de búsqueda
                      </p>
                    )}
                  </div>
                )}

                {filteredOptions.map((option) => {
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
        {/* Label */}
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
            
            // State variants - actualizados para consistencia con Input
            disabled
              ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
              : error
              ? 'border-rojo-una-2' 
              : 'border-gris-una bg-blanco-una-2 hover:border-gris-una/50',
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
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Campo de búsqueda (si está habilitado y hay suficientes items) */}
            {showSearch && (
              <div className="p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
                <div className="relative">
                  <SystemIcons.interface.search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-una w-4 h-4" 
                    size="sm" 
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-azul-una focus:ring-1 focus:ring-azul-una"
                    onClick={(e) => e.stopPropagation()} // Evitar que cierre el dropdown
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gris-una hover:text-negro-una p-1"
                    >
                      <SystemIcons.interface.closeCircle className="w-4 h-4" size="sm" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div 
              className="overflow-auto custom-scrollbar"
              style={{ maxHeight: getMaxHeight() }}
            >
              <div className="py-1 text-sm">
                {/* Botón Seleccionar todo dentro del dropdown */}
                {showSelectAll && filteredOptions.length > 1 && (
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
                
                {/* Mensaje cuando no hay resultados */}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-8 text-center text-gris-una">
                    <SystemIcons.interface.search className="w-8 h-8 mx-auto mb-2 opacity-50" size="md" />
                    <p className="text-sm">No se encontraron resultados</p>
                    {searchTerm && (
                      <p className="text-xs mt-1">
                        Intenta con otro término de búsqueda
                      </p>
                    )}
                  </div>
                )}

                {filteredOptions.map((option) => {
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