/**
 * FilterButton - Wrapper de SingleSelect para filtros compactos
 * 
 * Reutiliza SingleSelect pero con presentación simplificada:
 * - Solo muestra ícono de filtro con tooltip
 * - Badge cuando hay filtro activo (diferente al default)
 * - Mismo dropdown y lógica que SingleSelect
 * 
 * DECISIÓN DE DISEÑO:
 * Aunque reutiliza la lógica de SingleSelect mediante composición,
 * mantiene su propia implementación de dropdown por razones de UX:
 * 1. SingleSelect está optimizado para formularios (labels, floating, etc)
 * 2. FilterButton necesita un trigger visual completamente diferente (solo ícono)
 * 3. El dropdown es simple y compartir código aquí agregaría complejidad innecesaria
 * 
 * REFACTORIZACIÓN FUTURA:
 * Si se necesitan más variantes de selects compactos, considerar:
 * - Extraer lógica de dropdown a un hook useDropdown()
 * - Crear componente DropdownMenu reutilizable
 * - SingleSelect y FilterButton usarían estos primitivos
 */

import { useState, useRef, useEffect } from 'react';
import { SystemIcons } from '../Icons/SystemIcons';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Feedback/Tooltip';
import { Button } from './Button';
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
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera (misma lógica que SingleSelect)
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

  // Calcular posición del dropdown basado en espacio disponible
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 224; // w-56 = 14rem = 224px
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - buttonRect.right;
      
      // Si no hay suficiente espacio a la izquierda (posición por defecto),
      // abrirlo hacia la derecha
      if (spaceOnRight < dropdownWidth && buttonRect.left > dropdownWidth) {
        setDropdownPosition('right');
      } else {
        setDropdownPosition('left');
      }
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
          <div ref={buttonRef} className="inline-flex">
            <Button
              type="button"
              variant="ghost"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className={cn(
                "border border-blanco-una-2 bg-blanco-una-2",
                hasActiveFilter && "bg-azul-una/10"
              )}
            >
              <SystemIcons.interface.filter size="md" color="currentColor" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {tooltipText}
        </TooltipContent>
      </Tooltip>

      {/* Badge de filtro activo con botón para eliminar */}
      {hasActiveFilter && selectedOption && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-azul-una text-white">
          <span className="text-xs font-medium whitespace-nowrap">
            {selectedOption.label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(options[0].value); // Reset al primer valor (default)
            }}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
            aria-label="Eliminar filtro"
          >
            <SystemIcons.actions.cancel size="xs" color="currentColor" />
          </button>
        </div>
      )}

      {/* Dropdown menu - Se posiciona automáticamente según espacio disponible */}
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-2 w-56 rounded-corner bg-white shadow-lg border border-gray-300 overflow-hidden z-50",
            dropdownPosition === 'left' ? 'left-0' : 'right-0'
          )}
        >
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
                  
                  {/* Check icon - Mismo que SingleSelect para consistencia visual */}
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                      <SystemIcons.interface.check size="sm" color="currentColor" />
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
