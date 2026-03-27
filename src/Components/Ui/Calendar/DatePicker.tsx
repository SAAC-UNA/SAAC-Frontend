/**
 * DatePicker - Componente de calendario personalizado
 * 
 * Características:
 * - Calendario desplegable integrado
 * - Navegación por meses y años
 * - Validación de fechas
 * - Integración con formularios
 * - Localización en español
 * - Estados disabled/readonly
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { Button } from '@/Components/Ui/Buttons/Button';
import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP } from '@/Constants/Animations';

// React portals para el calendario, para evitar problemas de overflow en modales u otros contenedores
interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
}

export interface DatePickerProps {
  label?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  id?: string;
  placement?: 'top' | 'bottom';
  onChange?: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  placeholder = 'Selecciona una fecha...',
  disabled = false,
  error,
  helperText,
  required = false,
  className,
  minDate,
  maxDate,
  id,
  onChange
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const dateParts = value.split('-');
      return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    }
    return new Date();
  });

  // selectedDate se deriva del prop value (componente controlado)
  const selectedDate: Date | null = value ? (() => {
    const dateParts = value.split('-');
    return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  })() : null;

  // Cuando value cambia externamente, sincronizar currentDate para mostrar el mes correcto
  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    if (value) {
      const dateParts = value.split('-');
      setCurrentDate(new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
    }
  }

  const [showPicker, setShowPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = 320; // altura aproximada del calendario
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow >= estimatedHeight || spaceBelow >= rect.top) {
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left });
    } else {
      setDropdownPosition({ bottom: viewportHeight - rect.top + 4, left: rect.left });
    }
  }, []);

  // Cerrar calendario al hacer clic fuera
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

  // Reposicionar si hay scroll o resize mientras está abierto
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

  // Actualizar fecha seleccionada cuando cambia el valor
  // (ahora se deriva directamente de value prop - ver selectedDate arriba)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth()));
  };

  // Generar rango de años (considera minDate y maxDate si están definidos)
  const currentYear = new Date().getFullYear();
  const minYear = minDate ? new Date(minDate + 'T00:00:00').getFullYear() : currentYear - 10;
  const maxYear = maxDate ? new Date(maxDate + 'T00:00:00').getFullYear() : currentYear + 10;

  const yearRange = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // Si se hace clic en el mismo día ya seleccionado, des-seleccionar
    if (isSelected(day)) {
      handleClearDate();
      return;
    }

    // Crear fechas locales para comparación (sin conversión UTC)
    const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

    // Validar fecha mínima
    if (minDate) {
      const minDateObj = new Date(minDate + 'T00:00:00');
      const minDateOnly = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
      if (selectedDateOnly < minDateOnly) {
        return;
      }
    }

    // Validar fecha máxima
    if (maxDate) {
      const maxDateObj = new Date(maxDate + 'T00:00:00');
      const maxDateOnly = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
      if (selectedDateOnly > maxDateOnly) {
        return;
      }
    }

    // Formatear fecha en zona local para evitar desfase
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const dayFormatted = String(selected.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayFormatted}`;
    onChange?.(formattedDate);
    setShowPicker(false);
  };

  const handleClearDate = () => {
    onChange?.('');
    setShowPicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Comparar solo fechas, sin horas
    if (minDate) {
      const minDateObj = new Date(minDate + 'T00:00:00');
      const minDateOnly = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
      if (dateOnly < minDateOnly) return true;
    }

    if (maxDate) {
      const maxDateObj = new Date(maxDate + 'T00:00:00');
      const maxDateOnly = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
      if (dateOnly > maxDateOnly) return true;
    }

    return false;
  };

  const days = [];
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Clases base del input
  const hasValue = Boolean(selectedDate);

  const inputClasses = cn(
    'w-full h-10 rounded-corner border text-left cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
    `flex items-center justify-between px-3 py-2 ${TYPOGRAPHY.form.input}`,
    'placeholder-gris-una/60',
    // Estados
    disabled
      ? 'bg-gris-una/10 border-gris-una/5 text-gray-400 cursor-not-allowed'
      : error
        ? 'border-rojo-una-2 bg-blanco-una-2'
        : 'border-gris-una bg-blanco-una-2 hover:border-gris-una/50',
    showPicker && !disabled && 'border-gris-una',
    className
  );

  return (
    <div className="space-y-2" ref={containerRef}>

      {/* Input Container */}
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
          aria-label={label || 'Selector de fecha'}
        >
          <span className={cn(
            'text-left flex-1',
            !selectedDate && label && 'text-transparent', // Ocultar solo si hay label flotante
            !selectedDate && !label && 'text-gris-una/60'  // Mostrar placeholder normal si no hay label
          )}>
            {formatDate(selectedDate)}
          </span>

          <div className="flex items-center gap-1">
            {/* Botón para limpiar la fecha */}
            {selectedDate && !disabled && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDate();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearDate();
                  }
                }}
                className="p-0.5 hover:bg-gris-una/20 rounded transition-colors cursor-pointer"
                aria-label="Limpiar fecha"
              >
                <SystemIcons.actions.cancel className={`${ICON_SIZES.sm} text-gris-una`} />
              </div>
            )}

            <SystemIcons.interface.calendar className={`${ICON_SIZES.sm} text-gris-una`} />
          </div>
        </button>

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-300 pointer-events-none',
              'transform',
              TYPOGRAPHY.form.label,
              // Posición según contenido o estado abierto
              hasValue || showPicker
                ? 'top-0 scale-75 -translate-y-1/2'
                : 'top-1/2 scale-100 -translate-y-1/2',
              // Fondo para cortar la línea del borde
              hasValue || showPicker
                ? 'bg-blanco-una-2 px-2'
                : 'bg-transparent px-1',
              // Colores
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

        {/* Calendar via portal para no ser cortado por overflow del modal */}
        {!disabled && dropdownPosition && createPortal(
          <AnimatePresence>
            {showPicker && (
              <motion.div
                key="datepicker-dropdown"
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
                className="bg-blanco-una border border-gris-light rounded-corner shadow-lg p-3 w-72"
              >
                {/* Header with navigation and selectors */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevMonth}
                    aria-label="Mes anterior"
                  >
                    <SystemIcons.navigation.arrow.left className={`${ICON_SIZES.sm} text-gris-una`} />
                  </Button>

                  <div className="flex items-center gap-2 flex-1 justify-center">
                    {/* Selector de Mes */}
                    <select
                      value={currentDate.getMonth()}
                      onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                      className={`${TYPOGRAPHY.form.input} font-semibold text-negro-una bg-blanco-una border border-gris-light rounded-corner-sm px-2 py-1 hover:border-gris-una-2 focus:outline-none cursor-pointer`}
                      aria-label="Seleccionar mes"
                    >
                      {monthNames.map((month) => (
                        <option key={month} value={monthNames.indexOf(month)}>
                          {month}
                        </option>
                      ))}
                    </select>

                    {/* Selector de Año */}
                    <select
                      value={currentDate.getFullYear()}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      className={`${TYPOGRAPHY.form.input} font-semibold text-negro-una bg-blanco-una border border-gris-light rounded-corner-sm px-2 py-1 hover:border-gris-una-2 focus:outline-none cursor-pointer`}
                      aria-label="Seleccionar año"
                    >
                      {yearRange.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNextMonth}
                    aria-label="Mes siguiente"
                  >
                    <SystemIcons.navigation.arrow.right className={`${ICON_SIZES.sm} text-gris-una`} />
                  </Button>
                </div>

                {/* Day names header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className={`text-center ${TYPOGRAPHY.form.helper} font-medium text-gris-una py-1`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {days.map((day, idx) => (
                    <button
                      key={day ? day.toString() : `empty-${idx}`}
                      type="button"
                      onClick={() => day && !isDateDisabled(day) && handleSelectDate(day)}
                      disabled={!day || isDateDisabled(day)}
                      className={cn(
                        `p-1.5 ${TYPOGRAPHY.form.helper} rounded-corner font-medium transition-all min-h-[1.75rem] flex items-center justify-center`,
                        !day && 'opacity-0 cursor-default',
                        day && isDateDisabled(day) && 'opacity-30 cursor-not-allowed text-gris-una',
                        day && !isDateDisabled(day) && 'cursor-pointer',
                        isSelected(day) && 'bg-info-light text-info shadow-sm',
                        isToday(day) && !isSelected(day) && 'bg-error-light text-error border border-error-ring',
                        day && !isSelected(day) && !isToday(day) && !isDateDisabled(day) && 'hover:bg-gris-una/10 text-negro-una'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Close button */}
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
          document.body
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`flex items-center gap-2 ${TYPOGRAPHY.form.helper} text-rojo-una-2`}>
          <SystemIcons.interface.alert className={ICON_SIZES.sm} />
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={`${TYPOGRAPHY.form.helper} text-gris-una`}>
          {helperText}
        </p>
      )}
    </div>
  );
};