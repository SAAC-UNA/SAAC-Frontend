/**
 * EvidenceAssignmentFilters - Componente para filtrar y buscar asignaciones
 * HU-029 - Mis Evidencias Asignadas
 */

import React from 'react';
import type { AssignmentFilters } from '@/Types/EvidenceAssignmentTypes';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';

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
  return (
    <>
      <div className="flex gap-2 items-start">
        <SearchInput
          placeholder="Buscar evidencias..."
          value={filters.search || ''}
          onChange={(value) => onFiltersChange({ ...filters, search: value })}
        />
      </div>
    </>
  );
};
