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
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
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
      <div className="relative">
        <SystemIcons.interface.search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          placeholder="Buscar notificación..."
          className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-azul-una w-56"
        />
      </div>
    </div>
  );
};
