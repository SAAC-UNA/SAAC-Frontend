/**
 * EvidenceAssignmentFilters - Componente para filtrar y buscar asignaciones
 * HU-029 - Mis Evidencias Asignadas
 */

import React from 'react';
import type { AssignmentFilters, AssignmentStatus } from '@/Types/EvidenceAssignmentTypes';
import { STATUS_LABELS } from '@/Types/EvidenceAssignmentTypes';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';

interface EvidenceAssignmentFiltersProps {
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export const EvidenceAssignmentFilters: React.FC<EvidenceAssignmentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  // Opciones para el filtro de estado
  const statusOptions: FilterOption<AssignmentStatus | 'todos'>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: STATUS_LABELS.pendiente },
    { value: 'en_progreso', label: STATUS_LABELS.en_progreso },
    { value: 'completado', label: STATUS_LABELS.completado },
    { value: 'vencido', label: STATUS_LABELS.vencido }
  ];

  const handleEstadoChange = (estado: AssignmentStatus | 'todos') => {
    onFiltersChange({ ...filters, estado });
  };

  return (
    <>
      {/* Búsqueda y Filtro por estado */}
      <div className="flex gap-2 items-start">
        <SearchInput
          placeholder="Buscar por nombre de evidencia..."
          value={filters.search || ''}
          onChange={(value) => onFiltersChange({ ...filters, search: value })}
        />
        
        <FilterButton
          tooltipText="Filtrar por estado"
          options={statusOptions}
          value={filters.estado || 'todos'}
          onChange={handleEstadoChange}
        />
      </div>
    </>
  );
};
