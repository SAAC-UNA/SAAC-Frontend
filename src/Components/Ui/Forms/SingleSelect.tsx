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

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/Utils/ClassNames';
import { type ComponentSize } from '@/Constants/ComponentSizes';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

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
  id?: string;
  onChange?: (value: string) => void;
  // Modo readonly - solo mostrar información, no permitir selección
  readonly?: boolean;
  // Número máximo de items visibles en el dropdown (por defecto 3)
  maxVisibleItems?: number;
  // Búsqueda/Filtrado
  searchable?: boolean; // Habilitar búsqueda en el dropdown
  searchPlaceholder?: string; // Placeholder del campo de búsqueda
  minItemsForSearch?: number; // Número mínimo de items para mostrar búsqueda (default: 5)
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
  id,
  onChange,
  readonly = false,
  maxVisibleItems = 5,
  searchable = true, // Habilitado por defecto
  searchPlaceholder = 'Buscar...',
  minItemsForSearch = 5 // Mostrar búsqueda si hay 5 o más items
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = value ? options.find(opt => opt.value === value) || null : null;
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

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

  // Actualizar opción seleccionada cuando cambia el value prop
  // (ahora se deriva directamente en render - ver selectedOption arriba)

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    // Si la opción ya está seleccionada, deseleccionarla
    if (selectedOption?.value === option.value) {
      setIsOpen(false);
      setSearchTerm('');
      onChange?.('');
      return;
    }

    setIsOpen(false);
    setSearchTerm('');
    onChange?.(option.value);
  };

  const getDropdownSizeClasses = () => {
    switch (size) {
      case 'sm':
        return `py-1 ${TYPOGRAPHY.form.input}`;
      case 'lg':
        return `py-2 ${TYPOGRAPHY.form.input}`;
      default:
        return `py-1 ${TYPOGRAPHY.form.input}`;
    }
  };

  // Calcular altura máxima del dropdown basada en maxVisibleItems
  const getMaxHeight = () => {
    const itemHeight = 40; // Altura aproximada de cada item en px
    return `${itemHeight * maxVisibleItems}px`;
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
    const hasValue = Boolean(selectedOption);

    return (
      <div className={cn('relative w-full space-y-2', className)} ref={selectRef}>
        <div className="relative">
          {/* Select Button */}
          <button
            type="button"
            id={selectId}
            className={cn(
              // Base styles - Similar al Input actualizado
              `relative w-full h-10 px-4 ${TYPOGRAPHY.form.input} border rounded-corner text-left cursor-pointer transition-all duration-300`,
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
              <SystemIcons.interface.chevronDown
                className={cn(`${ICON_SIZES.sm} text-gris-una transition-transform duration-200`, isOpen && 'rotate-180')}
              />
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
                TYPOGRAPHY.form.label,
                
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
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-corner shadow-lg overflow-hidden"
          >
            {/* Campo de búsqueda (si está habilitado y hay suficientes items) */}
            {showSearch && (
              <div className="p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
                <div className="relative">
                  <SystemIcons.interface.search className={`absolute left-3 top-1/2 -translate-y-1/2 text-gris-una ${ICON_SIZES.sm}`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`w-full pl-9 pr-3 py-2 ${TYPOGRAPHY.form.input} border border-gray-300 rounded-corner focus:outline-none focus:border-azul-una focus:ring-1 focus:ring-azul-una`}
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
                      <SystemIcons.actions.cancel className={ICON_SIZES.sm} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div 
              className="overflow-auto custom-scrollbar"
              style={{ maxHeight: getMaxHeight() }}
            >
              <div className={cn('py-1', getDropdownSizeClasses())}>
                {/* Mensaje cuando no hay resultados */}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-8 text-center text-gris-una">
                    <SystemIcons.interface.search className={`${ICON_SIZES.lg} mx-auto mb-2 opacity-50`} />
                    <p className={TYPOGRAPHY.form.input}>No se encontraron resultados</p>
                    {searchTerm && (
                      <p className={`${TYPOGRAPHY.form.helper} mt-1`}>
                        Intenta con otro término de búsqueda
                      </p>
                    )}
                  </div>
                )}

                {filteredOptions.map((option) => (
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
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                        <SystemIcons.interface.check className={ICON_SIZES.sm} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
            <SystemIcons.interface.alert className={`${ICON_SIZES.sm} flex-shrink-0 text-rojo-una-2`} />
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
            `block font-medium ${TYPOGRAPHY.form.label} mb-2`,
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
          `relative w-full border rounded-corner text-left cursor-pointer transition-all duration-300 px-4 py-3 ${TYPOGRAPHY.form.input}`,
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
            <SystemIcons.interface.chevronDown
              className={cn(`${ICON_SIZES.sm} text-gris-una transition-transform duration-200`, isOpen && 'rotate-180')}
            />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {/* Allow showing dropdown in readonly mode (view-only) */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-corner shadow-lg overflow-hidden"
        >
          {/* Campo de búsqueda (si está habilitado y hay suficientes items) */}
          {showSearch && (
            <div className="p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
              <div className="relative">
                <SystemIcons.interface.search className={`absolute left-3 top-1/2 -translate-y-1/2 text-gris-una ${ICON_SIZES.sm}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-9 pr-3 py-2 ${TYPOGRAPHY.form.input} border border-gray-300 rounded-corner focus:outline-none focus:border-azul-una focus:ring-1 focus:ring-azul-una`}
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
                    <SystemIcons.actions.cancel className={ICON_SIZES.sm} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div 
            className="overflow-auto custom-scrollbar"
            style={{ maxHeight: getMaxHeight() }}
          >
            <div className={cn('py-1', getDropdownSizeClasses())}>
              {/* Mensaje cuando no hay resultados */}
              {filteredOptions.length === 0 && (
                <div className="px-4 py-8 text-center text-gris-una">
                  <SystemIcons.interface.search className={`${ICON_SIZES.lg} mx-auto mb-2 opacity-50`} />
                  <p className={TYPOGRAPHY.form.input}>No se encontraron resultados</p>
                  {searchTerm && (
                    <p className={`${TYPOGRAPHY.form.helper} mt-1`}>
                      Intenta con otro término de búsqueda
                    </p>
                  )}
                </div>
              )}

              {filteredOptions.map((option) => (
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
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                      <SystemIcons.interface.check className={ICON_SIZES.sm} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
          <SystemIcons.interface.alert className={`${ICON_SIZES.sm} flex-shrink-0 text-rojo-una-2`} />
          {error}
        </p>
      )}
    </div>
  );
};
