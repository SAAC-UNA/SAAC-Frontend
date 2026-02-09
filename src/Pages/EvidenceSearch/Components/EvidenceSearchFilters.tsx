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
import { CustomSelect } from '@/Components/Ui/SingleSelect';
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

  // Estados para opciones dinámicas
  const [criteriaOptions, setCriteriaOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [responsibleOptions, setResponsibleOptions] = useState<Array<{ value: number; label: string }>>([]);
  const [roleOptions, setRoleOptions] = useState<Array<{ value: number; label: string }>>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Estados de carga
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [loadingResponsibles, setLoadingResponsibles] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

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
      // Cargar criterios
      try {
        setLoadingCriteria(true);
        const criterios = await evidenceSearchFiltersService.getCriterios();
        setCriteriaOptions(criterios);
      } catch (error) {
        console.error('Error al cargar criterios:', error);
        showToast({ title: 'Error', message: 'Error al cargar criterios', type: 'error' });
      } finally {
        setLoadingCriteria(false);
      }

      // Cargar responsables
      try {
        setLoadingResponsibles(true);
        const usuarios = await evidenceSearchFiltersService.getUsuarios();
        setResponsibleOptions(usuarios);
      } catch (error) {
        console.error('Error al cargar responsables:', error);
        showToast({ title: 'Error', message: 'Error al cargar responsables', type: 'error' });
      } finally {
        setLoadingResponsibles(false);
      }

      // Cargar roles
      try {
        setLoadingRoles(true);
        const roles = await evidenceSearchFiltersService.getRoles();
        setRoleOptions(roles);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        showToast({ title: 'Error', message: 'Error al cargar roles', type: 'error' });
      } finally {
        setLoadingRoles(false);
      }

      // Cargar estados
      try {
        setLoadingStatus(true);
        const estados = await evidenceSearchFiltersService.getEstados();
        setStatusOptions(estados);
      } catch (error) {
        console.error('Error al cargar estados:', error);
        showToast({ title: 'Error', message: 'Error al cargar estados', type: 'error' });
      } finally {
        setLoadingStatus(false);
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
