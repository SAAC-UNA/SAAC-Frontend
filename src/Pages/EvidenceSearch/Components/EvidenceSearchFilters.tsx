/**
 * EvidenceSearchFilters - Componente de filtros para Búsqueda Avanzada de Evidencias (HU-012)
 * 
 * Permite filtrar evidencias por:
 * - Criterio específico
 * - Responsable de publicación
 * - Estado de la evidencia
 * - Rol con acceso
 * - Rango de fechas de publicación
 */

import React, { useState, useCallback } from 'react';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import type { EvidenceSearchFilters as Filters } from '@/Types/EvidenceSearchTypes';
import {
  mockCriteriaOptions,
  mockResponsibleOptions,
  mockRoleOptions,
  mockStatusOptions
} from '@/Mocks/EvidenceSearchMockData';

interface EvidenceSearchFiltersProps {
  onApplyFilters: (filters: Filters) => void;
  isLoading?: boolean;
}

export const EvidenceSearchFilters: React.FC<EvidenceSearchFiltersProps> = ({
  onApplyFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<Filters>({
    criterio: null,
    responsable_id: null,
    fecha_publicacion_desde: null,
    fecha_publicacion_hasta: null,
    estado: 'todos',
    rol_id: null,
    busqueda_general: ''
  });

  /**
   * Handler para cambios de filtros individuales con auto-aplicación
   */
  const handleInputChange = useCallback((field: keyof Filters, value: string | number | null) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    
    // Auto-aplicar filtros al cambiar
    onApplyFilters(newFilters);
  }, [filters, onApplyFilters]);

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: Filters = {
      criterio: null,
      responsable_id: null,
      fecha_publicacion_desde: null,
      fecha_publicacion_hasta: null,
      estado: 'todos',
      rol_id: null,
      busqueda_general: ''
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  }, [onApplyFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = filters.criterio !== null ||
    filters.responsable_id !== null ||
    filters.fecha_publicacion_desde !== null ||
    filters.fecha_publicacion_hasta !== null ||
    (filters.estado !== 'todos' && filters.estado !== null) ||
    filters.rol_id !== null ||
    (filters.busqueda_general !== null && filters.busqueda_general !== '');

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Filtro por criterio */}
        <div>
          <CustomSelect
            label="Criterio"
            value={filters.criterio || ''}
            onChange={(value) => handleInputChange('criterio', value || null)}
            options={[
              { value: '', label: 'Todos los criterios' },
              ...mockCriteriaOptions
            ]}
            placeholder="Todos los criterios"
            disabled={isLoading}
            searchable={true}
            searchPlaceholder="Buscar criterio..."
            minItemsForSearch={5}
            variant="floating"
          />
        </div>

        {/* Filtro por responsable */}
        <div>
          <CustomSelect
            label="Responsable"
            value={filters.responsable_id?.toString() || ''}
            onChange={(value) => handleInputChange('responsable_id', value ? parseInt(value) : null)}
            options={[
              { value: '', label: 'Todos los responsables' },
              ...mockResponsibleOptions.map((opt) => ({
                value: opt.value.toString(),
                label: opt.label
              }))
            ]}
            placeholder="Todos los responsables"
            disabled={isLoading}
            searchable={true}
            searchPlaceholder="Buscar responsable..."
            minItemsForSearch={3}
            variant="floating"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <CustomSelect
            label="Estado"
            value={filters.estado || 'todos'}
            onChange={(value) => handleInputChange('estado', value as typeof filters.estado || 'todos')}
            options={mockStatusOptions.map((opt) => ({
              value: opt.value,
              label: opt.label
            }))}
            disabled={isLoading}
            variant="floating"
          />
        </div>

        {/* Filtro por rol */}
        <div>
          <CustomSelect
            label="Rol"
            value={filters.rol_id?.toString() || ''}
            onChange={(value) => handleInputChange('rol_id', value ? parseInt(value) : null)}
            options={[
              { value: '', label: 'Todos los roles' },
              ...mockRoleOptions.map((opt) => ({
                value: opt.value.toString(),
                label: opt.label
              }))
            ]}
            placeholder="Todos los roles"
            disabled={isLoading}
            variant="floating"
          />
        </div>

        {/* Filtro por fecha desde */}
        <div>
          <DatePicker
            value={filters.fecha_publicacion_desde || ''}
            onChange={(date) => handleInputChange('fecha_publicacion_desde', date || null)}
            placeholder="Seleccione fecha inicio"
            disabled={isLoading}
            maxDate={filters.fecha_publicacion_hasta || undefined}
          />
        </div>

        {/* Filtro por fecha hasta */}
        <div>
          <DatePicker
            value={filters.fecha_publicacion_hasta || ''}
            onChange={(date) => handleInputChange('fecha_publicacion_hasta', date || null)}
            placeholder="Seleccione fecha fin"
            disabled={isLoading}
            minDate={filters.fecha_publicacion_desde || undefined}
          />
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
