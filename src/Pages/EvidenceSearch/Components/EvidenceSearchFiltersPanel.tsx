/**
 * EvidenceSearchFiltersPanel — Panel de filtros jerárquicos para búsqueda de evidencias
 *
 * Presenta tres selects en cascada:
 *   Dimensión → Componente (filtrado por dimensión) → Criterio (filtrado por componente)
 *
 * Al cambiar dimensión se resetea componente y criterio.
 * Al cambiar componente se resetea criterio.
 * Emite `onFiltersChange` con los filtros actualizados en cada cambio.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomSelect, type SelectOption } from '@/Components/Ui/Index';
import { Card } from '@/Components/Ui/Layout/Card';
import { evidenceSearchFiltersService } from '@/Services/EvidenceSearchService';
import type { EvidenceSearchFilters } from '@/Types/EvidenceSearchTypes';

interface ComponenteOption extends SelectOption {
  dimension_id: number;
}

interface EvidenceSearchFiltersPanelProps {
  onFiltersChange: (filters: EvidenceSearchFilters) => void;
}

export const EvidenceSearchFiltersPanel: React.FC<EvidenceSearchFiltersPanelProps> = ({
  onFiltersChange,
}) => {
  // Opciones cargadas del backend
  const [dimensiones, setDimensiones] = useState<SelectOption[]>([]);
  const [todosComponentes, setTodosComponentes] = useState<ComponenteOption[]>([]);
  const [todosCriterios, setTodosCriterios] = useState<SelectOption[]>([]);

  // Valores seleccionados
  const [dimensionId, setDimensionId] = useState<string>('');
  const [componenteId, setComponenteId] = useState<string>('');
  const [criterioId, setCriterioId] = useState<string>('');

  // Cargar datos al montar
  useEffect(() => {
    evidenceSearchFiltersService.getDimensiones().then(setDimensiones);
    evidenceSearchFiltersService.getComponentes().then(setTodosComponentes);
    evidenceSearchFiltersService.getCriterios().then(setTodosCriterios);
  }, []);

  // Componentes visibles — filtrados por dimensión seleccionada
  const componentesFiltrados = useMemo<SelectOption[]>(() => {
    if (!dimensionId) return todosComponentes;
    return todosComponentes.filter(c => c.dimension_id === parseInt(dimensionId));
  }, [dimensionId, todosComponentes]);

  // Criterios visibles — filtrados por componente seleccionado
  // El criterio ya tiene en su label la referencia al componente (nomenclatura)
  // pero necesitamos saber a qué componente pertenece.
  // Usamos el listado completo; si hay componente seleccionado filtramos los
  // criterios cuya nomenclatura empieza por la del componente.
  const criteriosFiltrados = useMemo<SelectOption[]>(() => {
    if (!componenteId) return todosCriterios;
    const comp = todosComponentes.find(c => c.value === componenteId);
    if (!comp) return todosCriterios;
    // La nomenclatura del componente es el prefijo de sus criterios (p.ej. "2.1" → "2.1.1", "2.1.2")
    const prefijo = comp.label.split(' - ')[0]; // extrae la nomenclatura
    return todosCriterios.filter(c => c.label.startsWith(prefijo));
  }, [componenteId, todosComponentes, todosCriterios]);

  // Emitir cambio de filtros
  const emitChange = useCallback(
    (nextDim: string, nextComp: string, nextCrit: string) => {
      onFiltersChange({
        dimension_id: nextDim ? parseInt(nextDim) : null,
        componente_id: nextComp ? parseInt(nextComp) : null,
        criterio: nextCrit || null,
      });
    },
    [onFiltersChange]
  );

  const handleDimensionChange = useCallback(
    (value: string) => {
      const next = value === '__all__' ? '' : value;
      setDimensionId(next);
      setComponenteId('');
      setCriterioId('');
      emitChange(next, '', '');
    },
    [emitChange]
  );

  const handleComponenteChange = useCallback(
    (value: string) => {
      const next = value === '__all__' ? '' : value;
      setComponenteId(next);
      setCriterioId('');
      emitChange(dimensionId, next, '');
    },
    [dimensionId, emitChange]
  );

  const handleCriterioChange = useCallback(
    (value: string) => {
      const next = value === '__all__' ? '' : value;
      setCriterioId(next);
      emitChange(dimensionId, componenteId, next);
    },
    [dimensionId, componenteId, emitChange]
  );

  const handleLimpiar = useCallback(() => {
    setDimensionId('');
    setComponenteId('');
    setCriterioId('');
    onFiltersChange({});
  }, [onFiltersChange]);

  const hayFiltrosActivos = dimensionId || componenteId || criterioId;

  // Opciones con entrada "Todas" al inicio
  const opcionesDimension = useMemo<SelectOption[]>(
    () => [{ value: '__all__', label: 'Todas las dimensiones' }, ...dimensiones],
    [dimensiones]
  );
  const opcionesComponente = useMemo<SelectOption[]>(
    () => [{ value: '__all__', label: 'Todos los componentes' }, ...componentesFiltrados],
    [componentesFiltrados]
  );
  const opcionesCriterio = useMemo<SelectOption[]>(
    () => [{ value: '__all__', label: 'Todos los criterios' }, ...criteriosFiltrados],
    [criteriosFiltrados]
  );

  return (
    <Card className="p-4 w-full">
      <div className="flex items-end gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <CustomSelect
              label="Dimensión"
              value={dimensionId || '__all__'}
              options={opcionesDimension}
              onChange={handleDimensionChange}
              searchable
              minItemsForSearch={4}
              size="sm"
            />
          </div>

          <div>
            <CustomSelect
              label="Componente"
              value={componenteId || '__all__'}
              options={opcionesComponente}
              onChange={handleComponenteChange}
              disabled={componentesFiltrados.length === 0}
              searchable
              minItemsForSearch={4}
              size="sm"
            />
          </div>

          <div>
            <CustomSelect
              label="Criterio"
              value={criterioId || '__all__'}
              options={opcionesCriterio}
              onChange={handleCriterioChange}
              disabled={criteriosFiltrados.length === 0}
              searchable
              minItemsForSearch={4}
              size="sm"
            />
          </div>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="text-xs text-azul-una hover:underline whitespace-nowrap pb-1"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </Card>
  );
};
