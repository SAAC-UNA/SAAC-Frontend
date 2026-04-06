/**
 * MultiSelect - Componente de selección múltiple
 *
 * Features:
 * - Floating labels por defecto
 * - Búsqueda/filtrado integrada
 * - Seleccionar/deseleccionar todo
 * - Diseño consistente con el sistema
 * - Animaciones fluidas con framer-motion (spring physics)
 * - Portal rendering para evitar overflow en modales
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
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

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  metadata?: string; // Texto adicional a mostrar al lado del label (ej: contador de usuarios)
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
  maxVisibleItems?: number;
  id?: string;
  onChange?: (values: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  minItemsForSearch?: number;
}

const EMPTY_VALUE: string[] = [];

// DropdownContent separado para que layoutId funcione correctamente dentro del portal

interface DropdownContentProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  dropdownPosition: DropdownPosition;
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchPlaceholder: string;
  filteredOptions: MultiSelectOption[];
  selectedOptions: MultiSelectOption[];
  maxHeight: string;
  handleOptionToggle: (option: MultiSelectOption) => void;
  handleSelectAll: () => void;
  isAllSelected: boolean;
  showSelectAll: boolean;
  selectAllText: string;
  deselectAllText: string;
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
  selectedOptions,
  maxHeight,
  handleOptionToggle,
  handleSelectAll,
  isAllSelected,
  showSelectAll,
  selectAllText,
  deselectAllText,
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
          className="p-2 border-b border-gris-light bg-blanco-una sticky top-0 z-10"
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

      <div className="overflow-auto custom-scrollbar" style={{ maxHeight }}>
        <div className={`py-1 ${TYPOGRAPHY.form.input}`}>

          {/* Botón Seleccionar todo */}
          {showSelectAll && filteredOptions.length > 1 && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04, duration: 0.15 }}
              onClick={handleSelectAll}
              className={cn(
                'relative w-full text-left px-4 py-2.5 focus:outline-none border-b border-gris-light',
                'flex items-center gap-2 cursor-pointer',
                'text-info font-semibold',
              )}
              onMouseEnter={() => setHoveredItem('__select-all__')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {hoveredItem === '__select-all__' && (
                <motion.div
                  layoutId={`${uniqueId}-indicator`}
                  className="absolute inset-0 bg-gris-light/60"
                  transition={SPRING_HOVER}
                />
              )}
              <span className="relative z-10">
                {isAllSelected ? deselectAllText : selectAllText}
              </span>
            </motion.button>
          )}

          {/* No results */}
          {filteredOptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-8 text-center text-gris-una"
            >
              <SystemIcons.interface.search className={`${ICON_SIZES.lg} mx-auto mb-2 opacity-50`} />
              <p className={TYPOGRAPHY.form.input}>No se encontraron resultados</p>
              {searchTerm && (
                <p className={`${TYPOGRAPHY.form.helper} mt-1`}>
                  Intenta con otro término de búsqueda
                </p>
              )}
            </motion.div>
          )}

          {filteredOptions.map((option, index) => {
            const isSelected = selectedOptions.some((s) => s.value === option.value);
            const isHovered = hoveredItem === option.value;
            const showIndicator = isHovered;

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
                  'flex items-center justify-between gap-2',
                  option.disabled
                    ? 'text-gris-una cursor-not-allowed opacity-50'
                    : 'cursor-pointer',
                  isSelected
                    ? 'text-negro-una font-medium'
                    : 'text-gris-una-3 hover:text-negro-una',
                )}
                onClick={() => handleOptionToggle(option)}
                disabled={option.disabled}
                onMouseEnter={() => setHoveredItem(option.value)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Fondo permanente para ítems seleccionados */}
                {isSelected && !option.disabled && (
                  <div className="absolute inset-0 bg-info/8 rounded-sm" />
                )}

                {/* Fondo hover deslizante */}
                {showIndicator && !option.disabled && (
                  <motion.div
                    layoutId={`${uniqueId}-indicator`}
                    className="absolute inset-0 bg-gris-light/60 rounded-sm"
                    transition={SPRING_HOVER}
                  />
                )}

                {/* Barra izquierda animada para ítems seleccionados */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      key="leftbar"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                      style={{ transformOrigin: 'center' }}
                      className="absolute left-0 top-0 bottom-0 my-auto w-0.75 h-5 rounded-full bg-info"
                    />
                  )}
                </AnimatePresence>

                {/* Contenido */}
                <span className="relative z-10 flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate">{option.label}</span>
                  {option.metadata && (
                    <span className={`${TYPOGRAPHY.form.helper} text-gris-una font-normal bg-gris-una/10 px-2 py-0.5 rounded-full shrink-0`}>
                      {option.metadata}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// MultiSelect

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value = EMPTY_VALUE,
  placeholder = 'Seleccionar...',
  options,
  disabled = false,
  error,
  className,
  required = false,
  variant = 'floating',
  showSelectAll = true,
  selectAllText = 'Seleccionar todo',
  deselectAllText = 'Deseleccionar todo',
  maxVisibleItems = 5,
  id,
  onChange,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  minItemsForSearch = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');

  const selectedOptions = value ? options.filter((opt) => value.includes(opt.value)) : [];
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;
  const uniqueId = `multiselect-${selectId}`;

  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = 280;
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow >= estimatedHeight || spaceBelow >= rect.top) {
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setOpenDirection('down');
    } else {
      setDropdownPosition({ bottom: viewportHeight - rect.top + 4, left: rect.left, width: rect.width });
      setOpenDirection('up');
    }
  }, []);

  const getMaxHeight = () => {
    const itemHeight = 46;
    return `${maxVisibleItems * itemHeight}px`;
  };

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
      setTimeout(() => { searchInputRef.current?.focus(); }, 100);
    }
  }, [isOpen, searchable, options.length, minItemsForSearch]);

  const handleOptionToggle = (option: MultiSelectOption) => {
    if (option.disabled || disabled) return;
    const isSelected = selectedOptions.some((s) => s.value === option.value);
    const newSelected = isSelected
      ? selectedOptions.filter((s) => s.value !== option.value)
      : [...selectedOptions, option];
    onChange?.(newSelected.map((opt) => opt.value));
  };

  const handleSelectAll = () => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    const allSelected = enabledOptions.every((opt) =>
      selectedOptions.some((s) => s.value === opt.value)
    );
    if (allSelected) {
      const newSelected = selectedOptions.filter(
        (s) => !enabledOptions.some((e) => e.value === s.value)
      );
      onChange?.(newSelected.map((opt) => opt.value));
    } else {
      const newSelected = [...selectedOptions];
      enabledOptions.forEach((opt) => {
        if (!newSelected.some((s) => s.value === opt.value)) newSelected.push(opt);
      });
      onChange?.(newSelected.map((opt) => opt.value));
    }
  };

  const isAllSelected = (() => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    return enabledOptions.length > 0 &&
      enabledOptions.every((opt) => selectedOptions.some((s) => s.value === opt.value));
  })();

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} elementos seleccionados`;
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const searchLower = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.value.toLowerCase().includes(searchLower)
    );
  }, [options, searchTerm]);

  const showSearch = searchable && options.length >= minItemsForSearch;

  // Props comunes para DropdownContent
  const dropdownProps = {
    dropdownRef,
    showSearch,
    searchTerm,
    setSearchTerm,
    searchInputRef,
    searchPlaceholder,
    filteredOptions,
    selectedOptions,
    maxHeight: getMaxHeight(),
    handleOptionToggle,
    handleSelectAll,
    isAllSelected,
    showSelectAll,
    selectAllText,
    deselectAllText,
    openDirection,
    uniqueId,
  };

  // Variante floating (default)
  if (variant === 'floating') {
    const hasValue = selectedOptions.length > 0;

    return (
      <div className={cn('relative w-full space-y-2', className)} ref={selectRef}>
        <div className="relative">
          {/* Trigger button */}
          <button
            ref={triggerRef}
            type="button"
            id={selectId}
            className={cn(
              `relative w-full h-10 px-4 ${TYPOGRAPHY.form.input} border rounded-corner text-left cursor-pointer transition-all duration-300`,
              'focus:outline-none focus:border-gris-una',
              'disabled:bg-blanco-una disabled:cursor-not-allowed',
              'peer',
              error ? 'border-rojo-una-2' : 'border-gris-light bg-blanco-una',
              disabled
                ? 'bg-gris-una/10 border-gris-light text-gris-una'
                : isOpen && 'border-gris-una/20'
            )}
            onClick={() => {
              if (!disabled) {
                if (!isOpen) calculateDropdownPosition();
                setIsOpen(!isOpen);
              }
            }}
            disabled={disabled}
          >
            <span className={cn('block truncate', selectedOptions.length === 0 && 'text-transparent')}>
              {hasValue ? getDisplayText() : placeholder}
            </span>

            {/* Chevron spring */}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={SPRING_CHEVRON}
                style={{ display: 'flex' }}
              >
                <SystemIcons.interface.chevronDown className={`${ICON_SIZES.sm} text-gris-una`} />
              </motion.span>
            </span>
          </button>

          {/* Floating Label */}
          {label && (
            <label
              htmlFor={selectId}
              className={cn(
                'absolute left-4 transition-all duration-300 pointer-events-none transform',
                TYPOGRAPHY.form.label,
                hasValue || isOpen
                  ? 'top-0 scale-75 -translate-y-1/2'
                  : 'top-1/2 scale-100 -translate-y-1/2',
                'peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2',
                'bg-transparent px-1 floating-label-halo',
                error
                  ? 'text-rojo-una-2'
                  : hasValue || isOpen
                    ? 'text-gris-una font-semibold'
                    : 'text-gris-una peer-focus:text-gris-una peer-focus:font-semibold',
              )}
            >
              {label}
              {required && <span className="text-rojo-una-2 ml-1">*</span>}
            </label>
          )}
        </div>

        {/* Dropdown via portal con AnimatePresence */}
        {!disabled && dropdownPosition && createPortal(
          <AnimatePresence>
            {isOpen && (
              <DropdownContent {...dropdownProps} dropdownPosition={dropdownPosition} />
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Error */}
        {error && (
          <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2`}>
            <SystemIcons.interface.alert className={`${ICON_SIZES.sm} shrink-0 text-rojo-una-2`} />
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
        <label className={cn(
          `block font-medium ${TYPOGRAPHY.form.label} mb-2`,
          disabled ? 'text-gris-una' : 'text-negro-una'
        )}>
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={cn(
          `relative w-full border rounded-corner text-left cursor-pointer transition-all duration-300 px-4 py-3 ${TYPOGRAPHY.form.input}`,
          'focus:outline-none focus:border-gris-una',
          'disabled:bg-gris-una/10 disabled:cursor-not-allowed',
          disabled
            ? 'bg-gris-una/10 border-gris-una/5 text-gris-una'
            : error
              ? 'border-rojo-una-2'
              : 'border-gris-una bg-blanco-una-2 hover:border-gris-una-2',
          isOpen && !disabled && 'border-gris-una-3'
        )}
        onClick={() => {
          if (!disabled) {
            if (!isOpen) calculateDropdownPosition();
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
      >
        <span className={cn('block truncate', selectedOptions.length === 0 && 'text-gris-una-2')}>
          {getDisplayText()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={SPRING_CHEVRON}
            style={{ display: 'flex' }}
          >
            <SystemIcons.interface.chevronDown className={`${ICON_SIZES.sm} text-gris-una`} />
          </motion.span>
        </span>
      </button>

      {/* Dropdown via portal con AnimatePresence */}
      {!disabled && dropdownPosition && createPortal(
        <AnimatePresence>
          {isOpen && (
            <DropdownContent {...dropdownProps} dropdownPosition={dropdownPosition} />
          )}
        </AnimatePresence>,
        document.body
      )}

      {error && (
        <p className={`text-rojo-una-2 ${TYPOGRAPHY.form.helper} flex items-center gap-2 mt-2`}>
          <SystemIcons.interface.alert className={`${ICON_SIZES.sm} shrink-0 text-rojo-una-2`} />
          {error}
        </p>
      )}
    </div>
  );
};