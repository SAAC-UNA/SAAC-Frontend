/**
 * AuditLogFilters - Componente de filtros para la Bitácora del Sistema (HU-005)
 * 
 * Permite filtrar registros por:
 * - Usuario (autocompletado)
 * - Módulo (select de módulos existentes)
 * - Tipo de acción (select de acciones)
 * - Rango de fechas (desde - hasta)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/Ui/Button';
import { Input } from '@/Components/Ui/Input';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { AuditLogFilters as Filters, ActionType } from '@/Types/AuditLogTypes';
import AuditLogService from '@/Services/AuditLogService';

interface AuditLogFiltersProps {
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<Filters>({
    modulo: undefined,
    tipo_accion: undefined,
    fecha_desde: undefined,
    fecha_hasta: undefined,
  });

  // Estados para catálogos dinámicos del backend
  const [modulos, setModulos] = useState<string[]>([]);
  const [tiposAccion, setTiposAccion] = useState<Array<{ value: string; label: string }>>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [modulosData, accionesData] = await Promise.all([
          AuditLogService.getModulos(),
          AuditLogService.getAcciones(),
        ]);

        setModulos(modulosData);
        
        // Transformar ActionType[] a formato de opciones para el select
        const accionesOptions = accionesData.map((accion: ActionType) => ({
          value: accion.descripcion,
          label: capitalize(accion.descripcion),
        }));
        setTiposAccion(accionesOptions);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        // Mantener arrays vacíos en caso de error
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  // Función auxiliar para capitalizar texto
  const capitalize = (text: string): string => {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleInputChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    // Filtrar valores vacíos
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof Filters] = value;
      }
      return acc;
    }, {} as Filters);

    onApplyFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      modulo: undefined,
      tipo_accion: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
    });
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SystemIcons.interface.search className="w-5 h-5 text-primary-600" />
          Filtros de Búsqueda
        </h3>
        {hasActiveFilters && (
          <span className="text-sm text-primary-600 font-medium">
            {Object.values(filters).filter(v => v !== undefined && v !== '').length} filtro(s) activo(s)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por Módulo */}
        <div>
          <label htmlFor="modulo" className="block text-sm font-medium text-gray-700 mb-1">
            Módulo
          </label>
          <select
            id="modulo"
            value={filters.modulo || ''}
            onChange={(e) => handleInputChange('modulo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={isLoading || catalogsLoading}
          >
            <option value="">
              {catalogsLoading ? 'Cargando módulos...' : 'Todos los módulos'}
            </option>
            {modulos.map((modulo) => (
              <option key={modulo} value={modulo}>
                {modulo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo de Acción */}
        <div>
          <label htmlFor="tipo_accion" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Acción
          </label>
          <select
            id="tipo_accion"
            value={filters.tipo_accion || ''}
            onChange={(e) => handleInputChange('tipo_accion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={isLoading || catalogsLoading}
          >
            <option value="">
              {catalogsLoading ? 'Cargando acciones...' : 'Todas las acciones'}
            </option>
            {tiposAccion.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Fecha Desde */}
        <div>
          <label htmlFor="fecha_desde" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <Input
            id="fecha_desde"
            type="date"
            value={filters.fecha_desde || ''}
            onChange={(e) => handleInputChange('fecha_desde', e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Filtro por Fecha Hasta */}
        <div>
          <label htmlFor="fecha_hasta" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <Input
            id="fecha_hasta"
            type="date"
            value={filters.fecha_hasta || ''}
            onChange={(e) => handleInputChange('fecha_hasta', e.target.value)}
            disabled={isLoading}
            min={filters.fecha_desde || undefined}
            className="w-full"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={isLoading || !hasActiveFilters}
          className="flex items-center gap-2"
        >
          <SystemIcons.actions.cancel className="w-4 h-4" />
          Limpiar Filtros
        </Button>
        <Button
          variant="primary"
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <SystemIcons.interface.search className="w-4 h-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};
