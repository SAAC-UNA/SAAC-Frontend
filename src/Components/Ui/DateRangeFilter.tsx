/**
 * DateRangeFilter - Componente para seleccionar un rango de fechas
 * Usado en filtros de búsqueda avanzada
 */

import React from 'react';
import { cn } from '@/Utils/ClassNames';

export interface DateRangeFilterProps {
  label: string;
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  disabled = false,
  minDate,
  maxDate
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onStartDateChange(value || null);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEndDateChange(value || null);
  };

  const handleClear = () => {
    onStartDateChange(null);
    onEndDateChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-azul-una hover:text-azul-una/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Fecha desde */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600">
            Desde
          </label>
          <input
            type="date"
            value={startDate || ''}
            onChange={handleStartChange}
            disabled={disabled}
            min={minDate}
            max={endDate || maxDate}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-azul-una focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
              'transition-colors duration-150'
            )}
          />
        </div>

        {/* Fecha hasta */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-600">
            Hasta
          </label>
          <input
            type="date"
            value={endDate || ''}
            onChange={handleEndChange}
            disabled={disabled}
            min={startDate || minDate}
            max={maxDate}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-azul-una focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
              'transition-colors duration-150'
            )}
          />
        </div>
      </div>

      {/* Validación visual */}
      {startDate && endDate && new Date(startDate) > new Date(endDate) && (
        <p className="text-xs text-red-600 mt-1">
          La fecha inicial no puede ser posterior a la fecha final
        </p>
      )}
    </div>
  );
};

export default DateRangeFilter;
