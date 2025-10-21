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

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

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
      return new Date(value);
    }
    return new Date();
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return value ? new Date(value) : null;
  });
  
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar fecha seleccionada cuando cambia el valor
  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

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

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Validar fecha mínima
    if (minDate && selected < new Date(minDate)) {
      return;
    }
    
    // Validar fecha máxima
    if (maxDate && selected > new Date(maxDate)) {
      return;
    }
    
    setSelectedDate(selected);
    const formattedDate = selected.toISOString().split('T')[0];
    onChange?.(formattedDate);
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
    
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    
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
  const inputClasses = cn(
    'w-full h-10 rounded-lg border text-left cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent',
    'flex items-center justify-between px-3 py-2 text-sm',
    'placeholder-gris-una/60',
    // Estados
    disabled
      ? 'bg-gris-una/10 border-gris-una/5 text-gray-400 cursor-not-allowed'
      : error
      ? 'border-rojo-una-2/5 bg-rojo-una-2/2'
      : 'border-gris-una/5 bg-gris-una/10 hover:border-gris-una/10',
    showPicker && !disabled && 'border-gris-una/20',
    className
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-negro-una"
        >
          {label}
          {required && <span className="text-rojo-una-2 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          onClick={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          className={inputClasses}
          aria-haspopup="dialog"
          aria-expanded={showPicker}
          aria-label={label || 'Selector de fecha'}
        >
          <span className={cn(
            'text-left',
            !selectedDate && 'text-gris-una/60'
          )}>
            {formatDate(selectedDate)}
          </span>
          
          <SystemIcons.interface.calendar size="sm" className="text-gris-una" />
        </button>

        {/* Calendar Dropdown */}
        {showPicker && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gris-una/30 rounded-lg shadow-lg p-3 z-50 max-w-xs">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gris-una/10 rounded transition-colors"
                aria-label="Mes anterior"
              >
                <SystemIcons.navigation.arrow.left size="sm" className="text-gris-una" />
              </button>
              
              <h3 className="text-sm font-semibold text-negro-una">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gris-una/10 rounded transition-colors"
                aria-label="Mes siguiente"
              >
                <SystemIcons.navigation.arrow.right size="sm" className="text-gris-una" />
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gris-una py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => day && !isDateDisabled(day) && handleSelectDate(day)}
                  disabled={!day || isDateDisabled(day)}
                  className={cn(
                    'p-1.5 text-xs rounded font-medium transition-all min-h-[1.75rem] flex items-center justify-center',
                    !day && 'opacity-0 cursor-default',
                    day && isDateDisabled(day) && 'opacity-30 cursor-not-allowed text-gris-una',
                    day && !isDateDisabled(day) && 'cursor-pointer',
                    isSelected(day) && 'bg-azul-una text-white shadow-sm',
                    isToday(day) && !isSelected(day) && 'bg-azul-una/10 text-azul-una border border-azul-una/30',
                    day && !isSelected(day) && !isToday(day) && !isDateDisabled(day) && 'hover:bg-gris-una/10 text-negro-una'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full px-3 py-1.5 bg-gris-una/10 text-negro-una rounded text-sm font-medium hover:bg-gris-una/20 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-rojo-una-2">
          <SystemIcons.interface.alert size="sm" />
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gris-una">
          {helperText}
        </p>
      )}
    </div>
  );
};