/**
 * DateRangePicker - Selector de rango de fechas
 *
 * Muestra dos meses en paralelo para seleccionar un rango inicio-fin.
 * Mismos estándares visuales que DatePicker: colores, bordes, animaciones y
 * conexión del panel con el trigger.
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP } from '@/Constants/Animations';

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  direction: 'down' | 'up';
}

export interface DateRange {
  from?: string;
  to?: string;
}

export interface DateRangePickerProps {
  label?: string;
  value?: DateRange;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  id?: string;
  /** Muestra los calendarios siempre visibles sin necesidad de hacer clic */
  inline?: boolean;
  onChange?: (range: DateRange) => void;
}

// ---- utilidades ----

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatShort(dateStr?: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ---- componente ----

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  value,
  placeholder = 'Selecciona un rango de fechas...',
  disabled = false,
  error,
  helperText,
  required = false,
  className,
  minDate,
  maxDate,
  id,
  inline = false,
  onChange,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [showPicker, setShowPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Panel izquierdo: mes del "from" o mes actual
  const [leftMonth, setLeftMonth] = useState<Date>(() => {
    if (value?.from) {
      const [y, m] = value.from.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  // ---- posición del portal ----

  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Panel doble: mínimo 560px, máximo viewport - 16px
    const panelWidth = Math.min(580, vw - 16);
    // Anclar desde el borde izquierdo del trigger pero no salirse de pantalla
    let left = rect.left;
    if (left + panelWidth > vw - 8) left = Math.max(8, vw - panelWidth - 8);

    const estimatedHeight = 370;
    const spaceBelow = vh - rect.bottom;
    if (spaceBelow >= estimatedHeight || spaceBelow >= rect.top) {
      setDropdownPosition({ top: rect.bottom, left, width: panelWidth, direction: 'down' });
    } else {
      setDropdownPosition({ bottom: vh - rect.top, left, width: panelWidth, direction: 'up' });
    }
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setShowPicker(false);
        setHoverDate(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reposicionar al hacer scroll/resize con el picker abierto
  useEffect(() => {
    if (!showPicker) return;
    const handler = () => calculateDropdownPosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [showPicker, calculateDropdownPosition]);

  // ---- lógica del rango ----

  // "from" es siempre la fecha de hoy
  const todayDate = new Date();
  const todayStr = toDateStr(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

  // Fecha efectiva de fin: valor real o preview hover
  const effectiveTo: string | undefined =
    hoverDate && hoverDate > todayStr
      ? hoverDate
      : value?.to;

  // renderFrom es siempre hoy, renderTo es el fin efectivo
  const renderFrom = effectiveTo ? todayStr : (value?.to ? todayStr : undefined);
  const renderTo   = effectiveTo;

  const isRangeStart  = (d: string) => Boolean(renderFrom && d === renderFrom && renderTo && renderFrom !== renderTo);
  const isRangeEnd    = (d: string) => Boolean(renderTo   && d === renderTo   && renderFrom && renderFrom !== renderTo);
  const isRangeMiddle = (d: string) => Boolean(renderFrom && renderTo && d > renderFrom && d < renderTo);
  const isSelected    = (d: string) => Boolean(
    (renderFrom && d === renderFrom) || (renderTo && d === renderTo)
  );
  const isSingleDay   = (d: string) => Boolean(renderFrom && renderTo && renderFrom === renderTo && d === renderFrom);

  const isDateDisabled = (d: string): boolean => {
    // Siempre deshabilitar días anteriores a hoy
    if (d < todayStr) return true;
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const handleDateClick = (dateStr: string) => {
    if (isDateDisabled(dateStr)) return;
    // from es siempre hoy; el usuario solo elige el fin
    if (dateStr === todayStr) {
      // Clic en hoy → limpiar
      onChange?.({});
    } else {
      onChange?.({ from: todayStr, to: dateStr });
    }
    setHoverDate(null);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange?.({});
    setHoverDate(null);
  };

  // ---- helpers del calendario ----

  const getDaysInMonth   = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const isToday = (dateStr: string): boolean => {
    const t = new Date();
    return dateStr === toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
  };

  // ---- render de un mes ----

  const renderMonth = (monthDate: Date, showLeftNav: boolean, showRightNav: boolean) => {
    const firstDay    = getFirstDayOfMonth(monthDate);
    const daysInMonth = getDaysInMonth(monthDate);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);

    return (
      <div className="flex-1 min-w-0">
        {/* Cabecera mes */}
        <div className="flex items-center justify-between gap-1 mb-3">
          {showLeftNav ? (
            <button
              type="button"
              onClick={() => setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1))}
              aria-label="Par de meses anterior"
              className="p-1.5 rounded-corner-sm hover:bg-gris-una/10 text-gris-una transition-colors"
            >
              <SystemIcons.navigation.arrow.left className={ICON_SIZES.sm} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <span className={`${TYPOGRAPHY.form.input} font-semibold text-negro-una text-center select-none`}>
            {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
          </span>

          {showRightNav ? (
            <button
              type="button"
              onClick={() => setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1))}
              aria-label="Par de meses siguiente"
              className="p-1.5 rounded-corner-sm hover:bg-gris-una/10 text-gris-una transition-colors"
            >
              <SystemIcons.navigation.arrow.right className={ICON_SIZES.sm} />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Nombres de días */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className={`text-center ${TYPOGRAPHY.form.helper} font-medium text-gris-una py-1`}>
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${monthDate.getMonth()}-${idx}`} className="h-9" />;

            const dateStr      = toDateStr(monthDate.getFullYear(), monthDate.getMonth(), day);
            const _isStart     = isRangeStart(dateStr);
            const _isEnd       = isRangeEnd(dateStr);
            const _isMiddle    = isRangeMiddle(dateStr);
            const _isSelected  = isSelected(dateStr);
            const _isSingle    = isSingleDay(dateStr);
            const _isToday     = isToday(dateStr);
            const _isDisabled  = isDateDisabled(dateStr);

            return (
              <div
                key={dateStr}
                className="relative flex items-center justify-center h-9"
              >
                {/* Franja de rango (fondo) */}
                {_isMiddle && (
                  <div className="absolute inset-y-1 inset-x-0 bg-info-light" />
                )}
                {_isStart && (
                  <div className="absolute inset-y-1 left-1/2 right-0 bg-info-light" />
                )}
                {_isEnd && (
                  <div className="absolute inset-y-1 right-1/2 left-0 bg-info-light" />
                )}

                {/* Botón del día */}
                <button
                  type="button"
                  disabled={_isDisabled}
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => { if (!_isDisabled) setHoverDate(dateStr); }}
                  onMouseLeave={() => setHoverDate(null)}
                  className={cn(
                    `relative z-10 w-full p-1.5 ${TYPOGRAPHY.form.helper} rounded-corner font-medium transition-all min-h-[1.75rem] flex items-center justify-center`,
                    _isDisabled && 'opacity-30 cursor-not-allowed text-gris-una',
                    !_isDisabled && 'cursor-pointer',
                    // Día único — mismas clases que DatePicker seleccionado
                    _isSingle && !_isDisabled && 'bg-info-light text-info shadow-sm',
                    // Extremos del rango
                    (_isStart || _isEnd) && !_isDisabled && 'bg-info-light text-info shadow-sm',
                    // Rango intermedio
                    _isMiddle && !_isDisabled && 'text-negro-una hover:bg-gris-una/10',
                    // Hoy (sin seleccionar) — mismo que DatePicker
                    _isToday && !_isSelected && !_isSingle && !_isDisabled && 'bg-error-light text-error border border-error-ring shadow-sm',
                    // Normal
                    !_isSelected && !_isSingle && !_isMiddle && !_isToday && !_isDisabled && 'hover:bg-gris-una/10 text-negro-una',
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- texto del trigger ----

  const hasValue = Boolean(value?.to);

  const displayText = (() => {
    const { to } = value || {};
    if (to) return `Hoy  –  ${formatShort(to)}`;
    return placeholder;
  })();

  // ---- modo inline ----

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
          'bg-blanco-una border rounded-corner p-4',
          error ? 'border-rojo-una-2' : 'border-gris-una',
        )}>
          <div className="flex gap-0">
            {renderMonth(leftMonth, true, false)}
            <div className="w-px bg-gris-light mx-3 self-stretch" />
            {renderMonth(rightMonth, false, true)}
          </div>
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

  // ---- clases del trigger ----

  const isOpenDown = showPicker && !disabled && dropdownPosition?.direction === 'down';
  const isOpenUp   = showPicker && !disabled && dropdownPosition?.direction === 'up';

  const triggerClasses = cn(
    'w-full h-10 border text-left cursor-pointer transition-all duration-200',
    'focus:outline-none',
    `flex items-center justify-between px-3 py-2 ${TYPOGRAPHY.form.input}`,
    isOpenDown ? 'rounded-t-corner rounded-b-none border-b-0'
    : isOpenUp ? 'rounded-b-corner rounded-t-none border-t-0'
    : 'rounded-corner',
    disabled
      ? 'bg-gris-una/10 border-gris-una/5 text-gray-400 cursor-not-allowed'
      : error
        ? 'border-rojo-una-2 bg-blanco-una-2'
        : 'border-gris-una bg-blanco-una-2 hover:border-gris-una/50',
    className,
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="relative">

        {/* Trigger */}
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              if (!showPicker) calculateDropdownPosition();
              setShowPicker(p => !p);
            }
          }}
          className={triggerClasses}
          aria-haspopup="dialog"
          aria-expanded={showPicker}
          aria-label={label || 'Selector de rango de fechas'}
        >
          <span className={cn(
            'text-left flex-1 truncate',
            !hasValue && label  && 'text-transparent',
            !hasValue && !label && 'text-gris-una/60',
          )}>
            {displayText}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {hasValue && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); handleClear(); }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }
                }}
                className="p-0.5 hover:bg-gris-una/20 rounded transition-colors cursor-pointer"
                aria-label="Limpiar rango"
              >
                <SystemIcons.actions.cancel className={`${ICON_SIZES.sm} text-gris-una`} />
              </div>
            )}
            <SystemIcons.interface.calendar className={`${ICON_SIZES.sm} text-gris-una`} />
          </div>
        </button>

        {/* Label flotante */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-300 pointer-events-none transform',
              TYPOGRAPHY.form.label,
              hasValue || showPicker
                ? 'top-0 scale-75 -translate-y-1/2 bg-blanco-una-2 px-2'
                : 'top-1/2 scale-100 -translate-y-1/2 bg-transparent px-1',
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

        {/* Portal con el panel de dos meses */}
        {!disabled && dropdownPosition && createPortal(
          <AnimatePresence>
            {showPicker && (
              <motion.div
                key="daterangepicker-dropdown"
                variants={dropdownPosition.direction === 'down' ? DROPDOWN_VARIANTS : DROPDOWN_VARIANTS_UP}
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  ...(dropdownPosition.top    !== undefined ? { top:    dropdownPosition.top    } : {}),
                  ...(dropdownPosition.bottom !== undefined ? { bottom: dropdownPosition.bottom } : {}),
                  left:  dropdownPosition.left,
                  width: dropdownPosition.width,
                  zIndex: 9999,
                }}
                className={cn(
                  'bg-blanco-una border border-gris-una shadow-lg p-4',
                  dropdownPosition.direction === 'down'
                    ? 'rounded-b-corner rounded-t-none border-t-0'
                    : 'rounded-t-corner rounded-b-none border-b-0',
                )}
              >
                {/* Indicador de paso */}
                <p className={`${TYPOGRAPHY.form.helper} text-gris-una mb-3`}>
                  {value?.to
                    ? `Hoy  –  ${formatShort(value.to)}`
                    : 'Selecciona la fecha de fin (el inicio es hoy)'}
                </p>

                {/* Dos calendarios */}
                <div className="flex gap-0">
                  {renderMonth(leftMonth, true, false)}
                  <div className="w-px bg-gris-light mx-3 self-stretch" />
                  {renderMonth(rightMonth, false, true)}
                </div>

                {/* Cerrar */}
                <button
                  type="button"
                  onClick={() => { setShowPicker(false); setHoverDate(null); }}
                  className={`w-full mt-3 py-1.5 px-3 ${TYPOGRAPHY.form.input} text-gris-una border border-gris-una rounded-corner-sm hover:bg-gris-una/10 transition-colors`}
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={`flex items-center gap-2 ${TYPOGRAPHY.form.helper} text-rojo-una-2`}>
          <SystemIcons.interface.alert className={ICON_SIZES.sm} />
          {error}
        </div>
      )}

      {/* Helper */}
      {helperText && !error && (
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>{helperText}</p>
      )}
    </div>
  );
};
