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

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { SystemIcons } from '../Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

// Variantes de animación para el dropdown
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96, transformOrigin: 'top center' },
  visible: {
    opacity: 1, y: 0, scale: 1, transformOrigin: 'top center',
    transition: { type: 'spring' as const, damping: 30, stiffness: 400, mass: 0.8 },
  },
  exit: {
    opacity: 0, y: -6, scale: 0.97, transformOrigin: 'top center',
    transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
  },
};

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
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // React portals
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuW = getMenuWidth();
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - rect.left;
    if (spaceOnRight >= menuW) {
      setDropdownCoords({ top: rect.bottom + 8, left: rect.left });
    } else {
      setDropdownCoords({ top: rect.bottom + 8, right: viewportWidth - rect.right });
    }
  }, [menuWidth]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        !buttonRef.current?.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reposicionar si hay scroll o resize mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => calculatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

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
          onClick={() => {
            if (!disabled) {
              if (!isOpen) calculatePosition();
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled}
          className="flex items-center gap-2"
          title={tooltip}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={TYPOGRAPHY.button}>{label}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.6 }}
            style={{ display: 'flex' }}
          >
            <SystemIcons.interface.chevronDown className={ICON_SIZES.button} />
          </motion.span>
        </Button>
      </div>

      {/* Menú desplegable via portal para evitar saltos de layout */}
      {!disabled && dropdownCoords && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="dropdown-button-menu"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: dropdownCoords.top,
                left: dropdownCoords.left,
                right: dropdownCoords.right,
                zIndex: 9999,
              }}
              className={cn(
                "rounded-corner bg-blanco-una shadow-lg border border-gris-light overflow-hidden",
                getMenuWidthClass(),
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
                      "hover:bg-gris-light/60 focus:bg-gris-light/60 focus:outline-none",
                      "transition-colors duration-150",
                      "flex items-center gap-3",
                      option.disabled 
                        ? "opacity-50 cursor-not-allowed text-gris-una" 
                        : "cursor-pointer text-negro-una-2 hover:text-negro-una",
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
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

