/**
 * NotificationFilters - Filtros para notificaciones
 * HU-018 - Notificaciones automáticas
 * 
 * Permite filtrar notificaciones por:
 * - Estado (leída/no leída/todas)
 * - Tipo de evento
 */

import React, { useState } from 'react';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { TIPO_EVENTO_LABELS } from '@/Types/NotificationTypes';
import type { NotificationFilters, TipoEvento } from '@/Types/NotificationTypes';

const EMPTY_FILTERS: NotificationFilters = {};

interface NotificationFiltersProps {
  onFilterChange: (filters: NotificationFilters) => void;
  initialFilters?: NotificationFilters;
}

export const NotificationFiltersComponent: React.FC<NotificationFiltersProps> = ({
  onFilterChange,
  initialFilters = EMPTY_FILTERS,
}) => {
  const [filters, setFilters] = useState<NotificationFilters>(() => initialFilters);

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Opciones para el filtro de estado
  const estadoOptions = [
    { value: '', label: 'Todas' },
    { value: 'false', label: 'No leídas' },
    { value: 'true', label: 'Leídas' },
  ];

  // Opciones para el filtro de tipo de evento
  const tipoEventoOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
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
              handleFilterChange('leida', value === 'true');
            }
          }}
          options={estadoOptions}
          size="sm"
          placeholder="Seleccionar estado"
        />
      </div>

      {/* Filtro por tipo de evento */}
      <div className="w-48">
        <CustomSelect
          label="Tipo de Evento"
          value={filters.tipo_evento || ''}
          onChange={(value) => {
            if (value === '') {
              const { tipo_evento, ...rest } = filters;
              setFilters(rest);
              onFilterChange(rest);
            } else {
              handleFilterChange('tipo_evento', value as TipoEvento);
            }
          }}
          options={tipoEventoOptions}
          size="sm"
          placeholder="Seleccionar tipo"
        />
      </div>
    </div>
  );
};
