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

import React, { useState, useCallback, useEffect } from 'react';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import type { EvidenceSearchFilters as Filters } from '@/Types/EvidenceSearchTypes';
import { evidenceSearchFiltersService } from '@/Services/EvidenceSearchService';
import { useToast } from '@/Context/ToastContext';

interface EvidenceSearchFiltersProps {
  onApplyFilters: (filters: Filters) => void;
  isLoading?: boolean;
}

export const EvidenceSearchFilters: React.FC<EvidenceSearchFiltersProps> = ({
  onApplyFilters,
  isLoading = false,
}) => {
  const { showToast } = useToast();

  // Estados para opciones dinámicas con sus cargas
  const [catalogState, setCatalogState] = useState<{
    criteria: { options: Array<{ value: string; label: string }>; loading: boolean };
    responsibles: { options: Array<{ value: number; label: string }>; loading: boolean };
    roles: { options: Array<{ value: number; label: string }>; loading: boolean };
    statuses: { options: Array<{ value: string; label: string }>; loading: boolean };
  }>({
    criteria: { options: [], loading: false },
    responsibles: { options: [], loading: false },
    roles: { options: [], loading: false },
    statuses: { options: [], loading: false },
  });
  const criteriaOptions = catalogState.criteria.options; const loadingCriteria = catalogState.criteria.loading;
  const responsibleOptions = catalogState.responsibles.options; const loadingResponsibles = catalogState.responsibles.loading;
  const roleOptions = catalogState.roles.options; const loadingRoles = catalogState.roles.loading;
  const statusOptions = catalogState.statuses.options; const loadingStatus = catalogState.statuses.loading;

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
   * Cargar opciones desde el backend al montar el componente
   */
  useEffect(() => {
    const loadFilterOptions = async () => {
      setCatalogState(prev => ({
        ...prev,
        criteria: { ...prev.criteria, loading: true },
        responsibles: { ...prev.responsibles, loading: true },
        roles: { ...prev.roles, loading: true },
        statuses: { ...prev.statuses, loading: true },
      }));

      const [criteriosResult, usuariosResult, rolesResult, estadosResult] = await Promise.allSettled([
        evidenceSearchFiltersService.getCriterios(),
        evidenceSearchFiltersService.getUsuarios(),
        evidenceSearchFiltersService.getRoles(),
        evidenceSearchFiltersService.getEstados(),
      ]);

      setCatalogState({
        criteria: { options: criteriosResult.status === 'fulfilled' ? criteriosResult.value : [], loading: false },
        responsibles: { options: usuariosResult.status === 'fulfilled' ? usuariosResult.value : [], loading: false },
        roles: { options: rolesResult.status === 'fulfilled' ? rolesResult.value : [], loading: false },
        statuses: { options: estadosResult.status === 'fulfilled' ? estadosResult.value : [], loading: false },
      });

      if (criteriosResult.status === 'rejected') {
        console.error('Error al cargar criterios:', criteriosResult.reason);
        showToast({ title: 'Error', message: 'Error al cargar criterios', type: 'error' });
      }
      if (usuariosResult.status === 'rejected') {
        console.error('Error al cargar responsables:', usuariosResult.reason);
        showToast({ title: 'Error', message: 'Error al cargar responsables', type: 'error' });
      }
      if (rolesResult.status === 'rejected') {
        console.error('Error al cargar roles:', rolesResult.reason);
        showToast({ title: 'Error', message: 'Error al cargar roles', type: 'error' });
      }
      if (estadosResult.status === 'rejected') {
        console.error('Error al cargar estados:', estadosResult.reason);
        showToast({ title: 'Error', message: 'Error al cargar estados', type: 'error' });
      }
    };

    loadFilterOptions();
  }, []);

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
              { value: '', label: loadingCriteria ? 'Cargando...' : 'Todos los criterios' },
              ...criteriaOptions
            ]}
            placeholder="Todos los criterios"
            disabled={isLoading || loadingCriteria}
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
              { value: '', label: loadingResponsibles ? 'Cargando...' : 'Todos los responsables' },
              ...responsibleOptions.map((opt) => ({
                value: opt.value.toString(),
                label: opt.label
              }))
            ]}
            placeholder="Todos los responsables"
            disabled={isLoading || loadingResponsibles}
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
            options={[
              { value: 'todos', label: loadingStatus ? 'Cargando...' : 'Todos los estados' },
              ...statusOptions.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))
            ]}
            disabled={isLoading || loadingStatus}
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
              { value: '', label: loadingRoles ? 'Cargando...' : 'Todos los roles' },
              ...roleOptions.map((opt) => ({
                value: opt.value.toString(),
                label: opt.label
              }))
            ]}
            placeholder="Todos los roles"
            disabled={isLoading || loadingRoles}
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
