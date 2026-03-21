/**
 * DropdownButton - Componente genérico de botón con menú desplegable
 * 
 * Características:
 * - Botón trigger personalizable (variant, size, icon, etc.)
 * - Menú desplegable con opciones configurables
 * - Cada opción puede tener ícono, label, y callback
 * - Posicionamiento automático según espacio disponible
 * - Soporte para deshabilitar opciones individuales
 * - Cierre automático al hacer click fuera
 * - Compatible con ButtonWithTooltip
 * 
 * Casos de uso:
 * - Botones de exportación con múltiples formatos
 * - Acciones agrupadas (editar, eliminar, duplicar)
 * - Menús contextuales
 * - Cualquier botón que necesite múltiples opciones
 */

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { SystemIcons } from '../Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

export interface DropdownOption {
  /** Identificador único de la opción */
  id: string;
  /** Texto a mostrar */
  label: ReactNode;
  /** Ícono opcional a la izquierda del label */
  icon?: ReactNode;
  /** Callback al hacer click en la opción */
  onClick: () => void;
  /** Deshabilitar esta opción específica */
  disabled?: boolean;
  /** Clase CSS adicional para esta opción */
  className?: string;
}

export interface DropdownButtonProps {
  /** Texto del botón */
  label: ReactNode;
  /** Ícono del botón (opcional) */
  icon?: ReactNode;
  /** Variante del botón */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Opciones del dropdown */
  options: DropdownOption[];
  /** Deshabilitar el botón completo */
  disabled?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Tooltip del botón (opcional) */
  tooltip?: string;
  /** Ancho del menú desplegable (default: 'auto') */
  menuWidth?: 'auto' | 'sm' | 'md' | 'lg';
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  label,
  icon,
  variant = 'outline',
  size = 'sm',
  options,
  disabled = false,
  className,
  tooltip,
  menuWidth = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  // Calcular posición del dropdown basado en espacio disponible
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = getMenuWidth();
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - buttonRect.right;
      
      if (spaceOnRight < dropdownWidth && buttonRect.left > dropdownWidth) {
        setDropdownPosition('right');
      } else {
        setDropdownPosition('left');
      }
    }
  }, [isOpen, menuWidth]);

  const getMenuWidth = () => {
    const widths = {
      auto: 224, // w-56 = 14rem = 224px
      sm: 192,   // w-48 = 12rem = 192px
      md: 256,   // w-64 = 16rem = 256px
      lg: 320    // w-80 = 20rem = 320px
    };
    return widths[menuWidth];
  };

  const getMenuWidthClass = () => {
    const classes = {
      auto: 'w-56',
      sm: 'w-48',
      md: 'w-64',
      lg: 'w-80'
    };
    return classes[menuWidth];
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      option.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Botón trigger */}
      <div ref={buttonRef}>
        <Button
          variant={variant}
          size={size}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center gap-2"
          title={tooltip}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={TYPOGRAPHY.button}>{label}</span>
          <SystemIcons.interface.chevronDown 
            className={cn(
              ICON_SIZES.button, "transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-2 rounded-corner bg-blanco-una-2 shadow-lg border border-gris-light overflow-hidden z-50",
            getMenuWidthClass(),
            dropdownPosition === 'left' ? 'left-0' : 'right-0'
          )}
        >
          <div className="py-1 overflow-auto custom-scrollbar" style={{ maxHeight: '320px' }}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={cn(
                  `relative w-full text-left px-4 py-2.5 ${TYPOGRAPHY.button}`,
                  "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                  "transition-colors duration-150",
                  "flex items-center gap-3",
                  option.disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer text-gray-900",
                  option.className
                )}
                role="menuitem"
              >
                {/* Ícono de la opción */}
                {option.icon && (
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {option.icon}
                  </span>
                )}
                
                {/* Label de la opción */}
                <span className="flex-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

