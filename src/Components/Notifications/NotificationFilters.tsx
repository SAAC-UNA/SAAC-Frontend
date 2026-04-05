/**
 * NotificationFilters - Filtros para notificaciones
 * HU-018 - Notificaciones automáticas
 *
 * Permite filtrar notificaciones por:
 * - Estado (leída/no leída/todas)
 * - Búsqueda por texto (título o contenido)
 */

import React, { useState } from 'react';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import type { NotificationFilters } from '@/Types/NotificationTypes';

const EMPTY_FILTERS: NotificationFilters = {};

interface NotificationFiltersProps {
  onFilterChange: (filters: NotificationFilters) => void;
  initialFilters?: NotificationFilters;
  onSearchChange?: (search: string) => void;
}

export const NotificationFiltersComponent: React.FC<NotificationFiltersProps> = ({
  onFilterChange,
  initialFilters = EMPTY_FILTERS,
  onSearchChange,
}) => {
  const [filters, setFilters] = useState<NotificationFilters>(() => initialFilters);
  const [search, setSearch] = useState('');

  // Opciones para el filtro de estado
  const estadoOptions = [
    { value: '', label: 'Todas' },
    { value: 'false', label: 'No leídas' },
    { value: 'true', label: 'Leídas' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Filtro por estado */}
      <div className="w-40">
        <CustomSelect
          label="Estado"
          value={filters.leida === undefined ? '' : filters.leida.toString()}
          onChange={(value) => {
            if (value === '') {
              const { leida, ...rest } = filters;
              setFilters(rest);
              onFilterChange(rest);
            } else {
              const newFilters = { ...filters, leida: value === 'true' };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }
          }}
          options={estadoOptions}
          size="sm"
          placeholder="Seleccionar estado"
        />
      </div>

      {/* Búsqueda por texto */}
      <SearchInput
        placeholder="Buscar notificación..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          onSearchChange?.(value);
        }}
        className="w-56"
      />
    </div>
  );
};
