/**
 * AuditLogFilters - Componente de filtros para la Bitácora del Sistema (HU-005)
 * 
 * Permite filtrar registros por:
 * - Rango de fechas (importantes para exportación)
 */

import React, { useState } from 'react';
import { Input } from '@/Components/Ui/Input';
import type { AuditLogFilters as Filters } from '@/Types/AuditLogTypes';

interface AuditLogFiltersProps {
  onApplyFilters: (filters: Filters) => void;
  isLoading?: boolean;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  onApplyFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<Filters>({
    fecha_desde: undefined,
    fecha_hasta: undefined,
  });

  const handleInputChange = (field: keyof Filters, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined,
    };
    setFilters(newFilters);
    
    // Auto-aplicar filtros de fecha al cambiar
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== '') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc as any)[key] = val;
      }
      return acc;
    }, {} as Filters);
    
    onApplyFilters(activeFilters);
  };

  return (
    <div className="flex gap-4 items-end mb-6">
      {/* Filtros de fecha - Visibles y destacados (importantes para exportación) */}
      <div className="min-w-[180px]">
        <label htmlFor="fecha_desde" className="block text-xs font-medium text-gray-600 mb-1">
          Fecha Desde
        </label>
        <Input
            id="fecha_desde"
            type="date"
            value={filters.fecha_desde || ''}
            onChange={(e) => handleInputChange('fecha_desde', e.target.value)}
            disabled={isLoading}
            className="w-full"
            placeholder="Seleccione fecha inicio"
        />
      </div>

      <div className="min-w-[180px]">
        <label htmlFor="fecha_hasta" className="block text-xs font-medium text-gray-600 mb-1">
          Fecha Hasta
        </label>
        <Input
            id="fecha_hasta"
            type="date"
            value={filters.fecha_hasta || ''}
            onChange={(e) => handleInputChange('fecha_hasta', e.target.value)}
            disabled={isLoading}
            min={filters.fecha_desde || undefined}
          className="w-full"
          placeholder="Seleccione fecha fin"
        />
      </div>
    </div>
  );
};