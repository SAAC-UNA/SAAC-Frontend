/**
 * YearPicker - Selector de anio personalizado.
 *
 * Variante del DatePicker enfocada en seleccionar anios completos.
 */

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/Components/Ui/Buttons/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP } from '@/Constants/Animations';
import { ICON_SIZES } from '@/Constants/Components';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

const DEFAULT_FUTURE_YEAR_RANGE = 20;
const YEARS_PER_PAGE = 20;

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
}

export interface YearPickerProps {
  label?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
  id?: string;
  inline?: boolean;
  onChange?: (year: string) => void;
}

const toNumberOrNull = (value?: string): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const YearPicker: React.FC<YearPickerProps> = ({
  label,
  value,
  placeholder = 'Selecciona un año...',
  disabled = false,
  error,
  helperText,
  required = false,
  className,
  minYear,
  maxYear,
  id,
  inline = false,
  onChange,
}) => {
  const currentYear = new Date().getFullYear();
  const resolvedMinYear = minYear ?? currentYear;
  const resolvedMaxYear = maxYear ?? currentYear + DEFAULT_FUTURE_YEAR_RANGE;
  const selectedYear = toNumberOrNull(value);
  const initialPageStart = selectedYear ?? resolvedMinYear;

  const [pageStartYear, setPageStartYear] = useState(initialPageStart);
  const [showPicker, setShowPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  useEffect(() => {
    if (selectedYear) {
      setPageStartYear(selectedYear);
    }
  }, [selectedYear]);

  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = 280;
    const spaceBelow = viewportHeight - rect.bottom;

    if (spaceBelow >= estimatedHeight || spaceBelow >= rect.top) {
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left });
    } else {
      setDropdownPosition({ bottom: viewportHeight - rect.top + 4, left: rect.left });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !containerRef.current?.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showPicker) return;
    const handleScrollOrResize = () => calculateDropdownPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showPicker, calculateDropdownPosition]);

  const visibleYears = useMemo(() => {
    const rangeStart = Math.max(resolvedMinYear, pageStartYear);
    const rangeEnd = Math.min(resolvedMaxYear, rangeStart + YEARS_PER_PAGE - 1);

    return Array.from(
      { length: Math.max(0, rangeEnd - rangeStart + 1) },
      (_, index) => rangeStart + index,
    );
  }, [pageStartYear, resolvedMaxYear, resolvedMinYear]);

  const canGoPrev = pageStartYear > resolvedMinYear;
  const canGoNext = pageStartYear + YEARS_PER_PAGE <= resolvedMaxYear;
  const hasValue = Boolean(selectedYear);

  const handlePrevPage = () => {
    setPageStartYear((year) => Math.max(resolvedMinYear, year - YEARS_PER_PAGE));
  };

  const handleNextPage = () => {
    setPageStartYear((year) => Math.min(resolvedMaxYear, year + YEARS_PER_PAGE));
  };

  const handleSelectYear = (year: number) => {
    onChange?.(String(year));
    if (!inline) setShowPicker(false);
  };

  const handleClearYear = () => {
    onChange?.('');
    if (!inline) setShowPicker(false);
  };

  const renderYearGrid = () => (
    <>
      <div className="flex items-center justify-between gap-2 mb-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handlePrevPage}
          disabled={!canGoPrev}
          aria-label="Rango anterior"
        >
          <SystemIcons.navigation.arrow.left className={`${ICON_SIZES.sm} text-gris-una`} />
        </Button>

        <span className={`${TYPOGRAPHY.form.input} font-semibold text-negro-una text-center select-none`}>
          {visibleYears[0] ?? resolvedMinYear} - {visibleYears[visibleYears.length - 1] ?? resolvedMaxYear}
        </span>

        <Button
          type="button"
          variant="ghost"
          onClick={handleNextPage}
          disabled={!canGoNext}
          aria-label="Rango siguiente"
        >
          <SystemIcons.navigation.arrow.right className={`${ICON_SIZES.sm} text-gris-una`} />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-3">
        {visibleYears.map((year) => {
          const isSelected = year === selectedYear;
          const isCurrent = year === currentYear;

          return (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className={cn(
                `p-2 ${TYPOGRAPHY.form.helper} rounded-corner font-medium transition-all min-h-[2rem] flex items-center justify-center`,
                'cursor-pointer',
                isSelected && 'bg-info-light text-info shadow-sm',
                isCurrent && !isSelected && 'bg-error-light text-error border border-error-ring',
                !isSelected && !isCurrent && 'hover:bg-gris-una/10 text-negro-una',
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </>
  );

  if (inline) {
    return (
      <div className={cn('space-y-1', className)}>
        {label && (
          <label className={cn(TYPOGRAPHY.form.label, 'block font-semibold', error ? 'text-rojo-una-2' : 'text-gris-una')}>
            {label}
            {required && <span className="text-rojo-una-2 ml-1">*</span>}
          </label>
        )}

        <div className={cn(
          'bg-blanco-una border rounded-corner p-3 w-72',
          error ? 'border-rojo-una-2' : 'border-gris-una',
        )}>
          {renderYearGrid()}
        </div>

        {error && (
          <div className={`flex items-center gap-2 ${TYPOGRAPHY.form.helper} text-rojo-una-2`}>
            <SystemIcons.interface.alert className={ICON_SIZES.sm} />
            {error}
          </div>
        )}
        {helperText && !error && (
          <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>{helperText}</p>
        )}
      </div>
    );
  }

  const inputClasses = cn(
    'w-full h-10 rounded-corner border text-left cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-1 focus:ring-gris-una focus:border-transparent',
    `flex items-center justify-between px-3 py-2 ${TYPOGRAPHY.form.input}`,
    'placeholder-gris-una/60',
    disabled
      ? 'bg-gris-una/10 border-gris-una/5 text-gris-light cursor-not-allowed'
      : error
        ? 'border-rojo-una-2 bg-blanco-una-2'
        : 'border-gris-light bg-blanco-una hover:border-gris-light',
    showPicker && !disabled && 'border-gris-una',
    className,
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="relative">
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          onClick={() => {
            if (!disabled) {
              if (!showPicker) calculateDropdownPosition();
              setShowPicker(!showPicker);
            }
          }}
          disabled={disabled}
          className={inputClasses}
          aria-haspopup="dialog"
          aria-expanded={showPicker}
          aria-label={label || 'Selector de año'}
        >
          <span className={cn(
            'text-left flex-1',
            !selectedYear && label && 'text-transparent',
            !selectedYear && !label && 'text-gris-una/60',
          )}>
            {selectedYear ?? placeholder}
          </span>

          <div className="flex items-center gap-1">
            {selectedYear && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearYear();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearYear();
                  }
                }}
                className="p-0.5 hover:bg-gris-una/20 rounded transition-colors cursor-pointer"
                aria-label="Limpiar año"
              >
                <SystemIcons.actions.cancel className={`${ICON_SIZES.sm} text-gris-una`} />
              </div>
            )}

            <SystemIcons.interface.calendar className={`${ICON_SIZES.sm} text-gris-una`} />
          </div>
        </button>

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-300 pointer-events-none transform',
              TYPOGRAPHY.form.label,
              hasValue || showPicker
                ? 'top-0 scale-75 -translate-y-1/2'
                : 'top-1/2 scale-100 -translate-y-1/2',
              'bg-transparent px-1 floating-label-halo',
              error
                ? 'text-rojo-una-2'
                : hasValue || showPicker
                  ? 'text-gris-una font-semibold'
                  : 'text-gris-una',
            )}
          >
            {label}
            {required && <span className="text-rojo-una-2 ml-1">*</span>}
          </label>
        )}

        {!disabled && dropdownPosition && createPortal(
          <AnimatePresence>
            {showPicker && (
              <motion.div
                key="yearpicker-dropdown"
                variants={
                  dropdownPosition.top !== undefined
                    ? DROPDOWN_VARIANTS
                    : DROPDOWN_VARIANTS_UP
                }
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  ...(dropdownPosition.top !== undefined ? { top: dropdownPosition.top } : {}),
                  ...(dropdownPosition.bottom !== undefined ? { bottom: dropdownPosition.bottom } : {}),
                  left: dropdownPosition.left,
                  zIndex: 9999,
                }}
                className="bg-blanco-una border border-none rounded-corner shadow-lg p-3 w-72"
              >
                {renderYearGrid()}

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setShowPicker(false)}
                >
                  Cerrar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>

      {error && (
        <div className={`flex items-center gap-2 ${TYPOGRAPHY.form.helper} text-rojo-una-2`}>
          <SystemIcons.interface.alert className={ICON_SIZES.sm} />
          {error}
        </div>
      )}

      {helperText && !error && (
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
