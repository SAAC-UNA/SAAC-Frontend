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
 * - Animaciones fluidas con framer-motion (spring physics)
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { type ComponentSize } from '@/Constants/ComponentSizes';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP, ITEM_VARIANTS, SPRING_HOVER, SPRING_CHEVRON } from '@/Constants/Animations';

// React portals
interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

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
  searchable?: boolean;
  searchPlaceholder?: string;
  minItemsForSearch?: number;
}

// Variantes de animación

// (centralizadas en @/Constants/Animations)

// DropdownContent
// Separado para poder usar layoutId correctamente dentro del portal

interface DropdownContentProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  dropdownPosition: DropdownPosition;
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchPlaceholder: string;
  filteredOptions: SelectOption[];
  selectedOption: SelectOption | null;
  readonly: boolean;
  maxHeight: string;
  dropdownSizeClasses: string;
  handleOptionSelect: (option: SelectOption) => void;
  openDirection: 'down' | 'up';
  uniqueId: string;
}

const DropdownContent: React.FC<DropdownContentProps> = ({
  dropdownRef,
  dropdownPosition,
  showSearch,
  searchTerm,
  setSearchTerm,
  searchInputRef,
  searchPlaceholder,
  filteredOptions,
  selectedOption,
  readonly,
  maxHeight,
  dropdownSizeClasses,
  handleOptionSelect,
  openDirection,
  uniqueId,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const variants = openDirection === 'up' ? DROPDOWN_VARIANTS_UP : DROPDOWN_VARIANTS;

  return (
    <motion.div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        bottom: dropdownPosition.bottom,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-blanco-una border-none rounded-corner shadow-lg overflow-hidden"
    >
      {/* Campo de búsqueda */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.15 }}
          className="p-2 border-b border-gris-light bg-blanco-una-2/80 sticky top-0 z-10"
        >
          <div className="relative">
            <SystemIcons.interface.search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-gris-una ${ICON_SIZES.sm}`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-3 py-2 ${TYPOGRAPHY.form.input} border border-gris-light rounded-corner focus:outline-none focus:border-info-ring focus:ring-1 focus:ring-info`}
              onClick={(e) => e.stopPropagation()}
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
        </motion.div>
      )}

      <div
        className="overflow-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        <div className={cn('py-1', dropdownSizeClasses)}>
          {/* No results */}
          {filteredOptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-8 text-center text-gris-una"
            >
              <SystemIcons.interface.search
                className={`${ICON_SIZES.lg} mx-auto mb-2 opacity-50`}
              />
              <p className={TYPOGRAPHY.form.input}>No se encontraron resultados</p>
              {searchTerm && (
                <p className={`${TYPOGRAPHY.form.helper} mt-1`}>
                  Intenta con otro término de búsqueda
                </p>
              )}
            </motion.div>
          )}

          {filteredOptions.map((option, index) => {
            const isSelected = selectedOption?.value === option.value;
            const isHovered = hoveredItem === option.value;
            const showIndicator = hoveredItem ? isHovered : isSelected;

            return (
              <motion.button
                key={option.value}
                type="button"
                custom={index}
                variants={ITEM_VARIANTS}
                initial="hidden"
                animate="visible"
                className={cn(
                  'relative w-full text-left px-4 py-2 focus:outline-none',
                  'flex items-center',
                  option.disabled
                    ? 'text-gris-una cursor-not-allowed'
                    : readonly
                      ? 'text-negro-una-2 cursor-default'
                      : 'cursor-pointer',
                  // Color base según estado
                  isSelected
                    ? 'text-negro-una font-medium'
                    : 'text-gris-una-3 hover:text-negro-una',
                  option.disabled && 'opacity-50'
                )}
                onClick={() => !readonly && handleOptionSelect(option)}
                disabled={option.disabled}
                onMouseEnter={() => setHoveredItem(option.value)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Fondo deslizante animado (hover/activo) */}
                {showIndicator && !option.disabled && (
                  <motion.div
                    layoutId={`${uniqueId}-indicator`}
                    className="absolute inset-0 bg-gris-light/60 rounded-sm"
                    transition={SPRING_HOVER}
                  />
                )}

                {/* Barra izquierda de acento para el ítem seleccionado */}
                {isSelected && (
                  <motion.div
                    layoutId={`${uniqueId}-leftbar`}
                    className="absolute left-0 top-0 bottom-0 my-auto w-0.75 h-5 rounded-full bg-info"
                    transition={SPRING_HOVER}
                  />
                )}

                {/* Label */}
                <span className="relative z-10 block truncate">{option.label}</span>


              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// CustomSelect

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  placeholder = 'Seleccionar...',
  options,
  variant = 'floating',
  size = 'sm',
  disabled = false,
  error,
  className,
  required = false,
  id,
  onChange,
  readonly = false,
  maxVisibleItems = 5,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  minItemsForSearch = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const selectedOption = value ? options.find((opt) => opt.value === value) || null : null;
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;
  const uniqueId = `select-${selectId}`;

  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = 250;
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow >= estimatedHeight || spaceBelow >= rect.top) {
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setOpenDirection('down');
    } else {
      setDropdownPosition({ bottom: viewportHeight - rect.top + 4, left: rect.left, width: rect.width });
      setOpenDirection('up');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !selectRef.current?.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => calculateDropdownPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculateDropdownPosition]);

  useEffect(() => {
    if (isOpen && searchable && options.length >= minItemsForSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable, options.length, minItemsForSearch]);

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;
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
      case 'sm': return `py-1 ${TYPOGRAPHY.form.input}`;
      case 'lg': return `py-2 ${TYPOGRAPHY.form.input}`;
      default: return `py-1 ${TYPOGRAPHY.form.input}`;
    }
  };

  const getMaxHeight = () => {
    const itemHeight = 40;
    return `${itemHeight * maxVisibleItems}px`;
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const searchLower = searchTerm.toLowerCase().trim();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.value.toLowerCase().includes(searchLower)
    );
  }, [options, searchTerm]);

  const showSearch = searchable && options.length >= minItemsForSearch;

  // Props comunes para el DropdownContent
  const dropdownProps = {
    dropdownRef,
    showSearch,
    searchTerm,
    setSearchTerm,
    searchInputRef,
    searchPlaceholder,
    filteredOptions,
    selectedOption,
    readonly,
    maxHeight: getMaxHeight(),
    dropdownSizeClasses: getDropdownSizeClasses(),
    handleOptionSelect,
    openDirection,
    uniqueId,
  };

  // Variante floating (default)
  if (variant === 'floating') {
    const hasValue = Boolean(selectedOption);

    return (
      <div className={cn('relative w-full space-y-2', className)} ref={selectRef}>
        <div className="relative">
          {/* Select Button */}
          <button
            ref={triggerRef}
            type="button"
            id={selectId}
            className={cn(
              `relative w-full h-10 px-4 ${TYPOGRAPHY.form.input} border rounded-corner text-left cursor-pointer transition-all duration-300`,
              'focus:outline-none focus:border-gris-una',
              'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
              'peer',
              readonly && 'cursor-default',
              error
                ? 'border-error'
                : 'border-gris-light bg-blanco-una',
              disabled
                ? 'bg-blanco-una-2 border-blanco-una-2 text-gris-una'
                : isOpen && !readonly && 'border-gris-una'
            )}
            onClick={() => {
              if (!disabled) {
                if (!isOpen) calculateDropdownPosition();
                setIsOpen(!isOpen);
              }
            }}
            disabled={disabled}
          >
            <span className={cn('block truncate', !selectedOption && 'text-transparent')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            {/* Chevron animado */}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={SPRING_CHEVRON}
                style={{ display: 'flex' }}
              >
                <SystemIcons.interface.chevronDown
                  className={`${ICON_SIZES.sm} text-gris-una`}
                />
              </motion.span>
            </span>
          </button>

          {/* Floating Label */}
          {label && (
            <label
              htmlFor={selectId}
              className={cn(
                'absolute left-4 transition-all duration-300 pointer-events-none',
                'transform',
                TYPOGRAPHY.form.label,
                hasValue || isOpen
                  ? 'top-0 scale-75 -translate-y-1/2'
                  : 'top-1/2 scale-100 -translate-y-1/2',
                'peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2',
                'bg-transparent px-1 floating-label-halo',
                error
                  ? 'text-error'
                  : hasValue || isOpen
                    ? 'text-gris-una font-semibold'
                    : 'text-gris-una peer-focus:text-gris-una peer-focus:font-semibold',
              )}
            >
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}
        </div>

        {/* Dropdown via portal con AnimatePresence */}
        {!disabled && dropdownPosition && createPortal(
          <AnimatePresence>
            {isOpen && (
              <DropdownContent
                {...dropdownProps}
                dropdownPosition={dropdownPosition}
              />
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Error Message */}
        {error && (
          <p className={`text-error ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
            <SystemIcons.interface.alert
              className={`${ICON_SIZES.sm} shrink-0 text-error`}
            />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Variante tradicional (compatibilidad)
  return (
    <div className={cn('relative w-full', className)} ref={selectRef}>
      {label && (
        <label
          className={cn(
            `block font-medium ${TYPOGRAPHY.form.label} mb-2`,
            disabled ? 'text-gray-400' : 'text-negro-una'
          )}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={cn(
          `relative w-full border rounded-corner text-left cursor-pointer transition-all duration-300 px-4 py-3 ${TYPOGRAPHY.form.input}`,
          'focus:outline-none focus:border-gris-una',
          'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          readonly && 'cursor-default',
          disabled
            ? 'bg-gris-una/10 border-gris-una/5 text-gray-400'
            : error
              ? 'border-error'
              : 'border-gris-una bg-blanco-una-2 hover:border-gris-una/50',
          isOpen && !disabled && !readonly && 'border-gris-una/20'
        )}
        onClick={() => {
          if (!disabled && !readonly) {
            if (!isOpen) calculateDropdownPosition();
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
      >
        <span className={cn('block truncate', !selectedOption && 'text-gris-una/60')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {!readonly && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={SPRING_CHEVRON}
              style={{ display: 'flex' }}
            >
              <SystemIcons.interface.chevronDown
                className={`${ICON_SIZES.sm} text-gris-una`}
              />
            </motion.span>
          </span>
        )}
      </button>

      {/* Dropdown via portal con AnimatePresence */}
      {!disabled && dropdownPosition && createPortal(
        <AnimatePresence>
          {isOpen && (
            <DropdownContent
              {...dropdownProps}
              dropdownPosition={dropdownPosition}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Error Message */}
      {error && (
        <p className={`text-error ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
          <SystemIcons.interface.alert
            className={`${ICON_SIZES.sm} shrink-0 text-error`}
          />
          {error}
        </p>
      )}
    </div>
  );
};
