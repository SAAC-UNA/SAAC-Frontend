/**
 * AuditLogFilters - Componente de filtros para la Bitácora del Sistema (HU-005)
 * 
 * Permite filtrar registros por:
 * - Módulo del sistema
 * - Tipo de acción
 * - Rango de fechas (importantes para exportación)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { DatePicker } from '@/Components/Ui/Calendar/DatePicker';
import type { SelectOption } from '@/Components/Ui/SingleSelect';
import type { AuditLogFilters as Filters, ActionType } from '@/Types/AuditLogTypes';
import AuditLogService from '@/Services/AuditLogService';
import { userService } from '@/Services/UserService';
import type { BackendUser } from '@/Services/UserService';

interface AuditLogFiltersProps {
  onApplyFilters: (filters: Filters) => void;
  isLoading?: boolean;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  onApplyFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<Filters>({
    usuario_id: undefined,
    modulo: undefined,
    tipo_accion: undefined,
    fecha_desde: undefined,
    fecha_hasta: undefined,
  });

  // Catálogos desde el backend
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  /**
   * Cargar catálogos de módulos y tipos de acción al montar el componente
   */
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        // Cargar cada catálogo independientemente para que si uno falla, los otros se carguen
        const [usersResult, modulesResult, actionTypesResult] = await Promise.allSettled([
          userService.listUsers(),
          AuditLogService.getModules(),
          AuditLogService.getActionTypes(),
        ]);

        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value);
        } else {
          console.error('Error cargando usuarios:', usersResult.reason);
        }

        if (modulesResult.status === 'fulfilled') {
          setModules(modulesResult.value);
        } else {
          console.error('Error cargando módulos:', modulesResult.reason);
        }

        if (actionTypesResult.status === 'fulfilled') {
          setActionTypes(actionTypesResult.value);
        } else {
          console.error('Error cargando tipos de acción:', actionTypesResult.reason);
        }
      } catch (error) {
        console.error('Error inesperado cargando catálogos:', error);
      } finally {
        setLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, []);

  const handleInputChange = (field: keyof Filters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined,
    };
    setFilters(newFilters);
    
    // Auto-aplicar filtros al cambiar
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== '') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc as any)[key] = val;
      }
      return acc;
    }, {} as Filters);
    
    onApplyFilters(activeFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: Filters = {
      usuario_id: undefined,
      modulo: undefined,
      tipo_accion: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
    };
    setFilters(clearedFilters);
    onApplyFilters({});
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

  // Convertir usuarios a SelectOption[]
  const userOptions = useMemo((): SelectOption[] => {
    return users.map(user => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`
    }));
  }, [users]);

  // Convertir módulos a SelectOption[]
  const moduleOptions = useMemo((): SelectOption[] => {
    return modules.map(module => ({
      value: module,
      label: module
    }));
  }, [modules]);

  // Convertir tipos de acción a SelectOption[]
  const actionTypeOptions = useMemo((): SelectOption[] => {
    return actionTypes.map(actionType => ({
      value: actionType.descripcion,
      label: actionType.descripcion
    }));
  }, [actionTypes]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Filtro por Usuario */}
        <div>
          <CustomSelect
            label="Usuario"
            value={filters.usuario_id?.toString() || ''}
            options={userOptions}
            placeholder="Todos los usuarios"
            onChange={(value) => handleInputChange('usuario_id', value ? parseInt(value) : '')}
            disabled={isLoading || loadingCatalogs}
            searchable={true}
            searchPlaceholder="Buscar usuario..."
            minItemsForSearch={3}
            variant="floating"
          />
        </div>

        {/* Filtro por Módulo */}
        <div>
          <CustomSelect
            label="Módulo del Sistema"
            value={filters.modulo || ''}
            options={moduleOptions}
            placeholder="Todos los módulos"
            onChange={(value) => handleInputChange('modulo', value)}
            disabled={isLoading || loadingCatalogs}
            searchable={true}
            searchPlaceholder="Buscar módulo..."
            minItemsForSearch={10}
            variant="floating"
          />
        </div>

        {/* Filtro por Tipo de Acción */}
        <div>
          <CustomSelect
            label="Tipo de Acción"
            value={filters.tipo_accion || ''}
            options={actionTypeOptions}
            placeholder="Todas las acciones"
            onChange={(value) => handleInputChange('tipo_accion', value)}
            disabled={isLoading || loadingCatalogs}
            searchable={true}
            searchPlaceholder="Buscar acción..."
            minItemsForSearch={10}
            variant="floating"
          />
        </div>

        {/* Filtro por Fecha Desde */}
        <div>
          <DatePicker
            id="fecha_desde"
            label="Fecha inicio"
            value={filters.fecha_desde || ''}
            onChange={(date) => handleInputChange('fecha_desde', date)}
            disabled={isLoading}
            placeholder="Seleccione fecha inicio"
            maxDate={filters.fecha_hasta || undefined}
          />
        </div>

        {/* Filtro por Fecha Hasta */}
        <div>
          <DatePicker
            id="fecha_hasta"
            label="Fecha fin"
            value={filters.fecha_hasta || ''}
            onChange={(date) => handleInputChange('fecha_hasta', date)}
            disabled={isLoading}
            minDate={filters.fecha_desde || undefined}
            placeholder="Seleccione fecha fin"
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
            className={`${TYPOGRAPHY.button} text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};