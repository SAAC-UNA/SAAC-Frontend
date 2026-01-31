/**
 * EvidenceSearchPage - Página de búsqueda avanzada de evidencias
 * Mockup funcional para demostración del diseño y flujo de búsqueda con filtros
 * 
 * Características:
 * - Filtros múltiples: criterio, responsable, fecha, estado, rol
 * - Ordenamiento configurable
 * - Paginación
 * - Exportación a PDF/Excel (simulada)
 * - Restricción de resultados según rol del usuario
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button } from '@/Components/Ui/Button';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { CustomSelect } from '@/Components/Ui/SingleSelect';
import { DateRangeFilter } from '@/Components/Ui/DateRangeFilter';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { EvidenceSearchResultsTable } from './Components/EvidenceSearchResultsTable';
import { useToast } from '@/Context/ToastContext';
import { cn } from '@/Utils/ClassNames';
import type {
  EvidenceSearchFilters,
  EvidenceSearchResult,
  SortField,
  SortDirection,
  ExportFormat
} from '@/Types/EvidenceSearchTypes';
import {
  mockEvidenceResults,
  mockCriteriaOptions,
  mockResponsibleOptions,
  mockRoleOptions,
  mockStatusOptions
} from '@/Mocks/EvidenceSearchMockData';
import { SORT_FIELD_LABELS } from '@/Types/EvidenceSearchTypes';

export const EvidenceSearchPage: React.FC = () => {
  const { showToast } = useToast();

  // Estado de filtros
  const [filters, setFilters] = useState<EvidenceSearchFilters>({
    criterio: null,
    responsable_id: null,
    fecha_publicacion_desde: null,
    fecha_publicacion_hasta: null,
    estado: 'todos',
    rol_id: null,
    busqueda_general: ''
  });

  // Estado de ordenamiento
  const [sortField, setSortField] = useState<SortField>('fecha_publicacion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estado de resultados
  const [filteredResults, setFilteredResults] = useState<EvidenceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    setFilteredResults(mockEvidenceResults);
  }, []);

  // Aplicar filtros y ordenamiento
  const applyFiltersAndSort = useCallback(() => {
    setLoading(true);

    // Simular delay de API
    setTimeout(() => {
      let filtered = [...mockEvidenceResults];

      // Filtro por búsqueda general
      if (filters.busqueda_general) {
        const searchLower = filters.busqueda_general.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.descripcion.toLowerCase().includes(searchLower) ||
            item.criterio_nomenclatura.toLowerCase().includes(searchLower) ||
            item.criterio_descripcion.toLowerCase().includes(searchLower) ||
            item.responsable.nombre.toLowerCase().includes(searchLower)
        );
      }

      // Filtro por criterio
      if (filters.criterio) {
        filtered = filtered.filter(
          (item) => item.criterio_nomenclatura === filters.criterio
        );
      }

      // Filtro por responsable
      if (filters.responsable_id) {
        filtered = filtered.filter(
          (item) => item.responsable.usuario_id === filters.responsable_id
        );
      }

      // Filtro por fecha desde
      if (filters.fecha_publicacion_desde) {
        filtered = filtered.filter(
          (item) =>
            new Date(item.fecha_publicacion) >= new Date(filters.fecha_publicacion_desde!)
        );
      }

      // Filtro por fecha hasta
      if (filters.fecha_publicacion_hasta) {
        const endDate = new Date(filters.fecha_publicacion_hasta);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día
        filtered = filtered.filter(
          (item) => new Date(item.fecha_publicacion) <= endDate
        );
      }

      // Filtro por estado
      if (filters.estado && filters.estado !== 'todos') {
        filtered = filtered.filter((item) => item.estado === filters.estado);
      }

      // Filtro por rol (simular restricción de permisos)
      if (filters.rol_id) {
        // En un escenario real, esto vendría del backend
        // Por ahora solo filtramos los que tienen ese rol en roles_acceso
        const roleNames: Record<number, string> = {
          1: 'Administrador',
          2: 'Coordinador',
          3: 'Auditor',
          4: 'Docente',
          5: 'Estudiante'
        };
        const roleName = roleNames[filters.rol_id];
        if (roleName) {
          filtered = filtered.filter((item) =>
            item.roles_acceso.includes(roleName)
          );
        }
      }

      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let compareValue = 0;

        switch (sortField) {
          case 'fecha_publicacion':
            compareValue =
              new Date(a.fecha_publicacion).getTime() -
              new Date(b.fecha_publicacion).getTime();
            break;
          case 'criterio':
            compareValue = a.criterio_nomenclatura.localeCompare(
              b.criterio_nomenclatura
            );
            break;
          case 'responsable':
            compareValue = a.responsable.nombre.localeCompare(b.responsable.nombre);
            break;
          case 'estado':
            compareValue = a.estado.localeCompare(b.estado);
            break;
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
      });

      setFilteredResults(filtered);
      setCurrentPage(1);
      setLoading(false);

      // Mostrar mensaje con cantidad de resultados
      if (filtered.length === 0) {
        showToast({
          type: 'info',
          title: 'No se encontraron evidencias con los filtros aplicados'
        });
      } else {
        showToast({
          type: 'success',
          title: `Se encontraron ${filtered.length} evidencia(s)`
        });
      }
    }, 800);
  }, [filters, sortField, sortDirection, showToast]);

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      criterio: null,
      responsable_id: null,
      fecha_publicacion_desde: null,
      fecha_publicacion_hasta: null,
      estado: 'todos',
      rol_id: null,
      busqueda_general: ''
    });
    setSortField('fecha_publicacion');
    setSortDirection('desc');
    setFilteredResults(mockEvidenceResults);
    showToast({ type: 'info', title: 'Filtros limpiados' });
  };

  // Exportar resultados
  const handleExport = (format: ExportFormat) => {
    setLoading(true);

    // Simular exportación
    setTimeout(() => {
      setLoading(false);
      
      const fileName = `evidencias_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      showToast({
        type: 'success',
        title: `Archivo ${fileName} generado exitosamente. Descarga iniciada.`
      });

      // En producción, aquí se generaría y descargaría el archivo real
      console.log(`Exportando ${filteredResults.length} evidencias a ${format}`);
    }, 1500);
  };

  // Ver detalles de evidencia
  const handleViewDetails = (evidenceId: number) => {
    showToast({
      type: 'info',
      title: `Mostrando detalles de evidencia #${evidenceId} (funcionalidad pendiente)`
    });
  };

  // Cálculos de paginación
  const totalResults = filteredResults.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Opciones de ordenamiento
  const sortFieldOptions = Object.entries(SORT_FIELD_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const sortDirectionOptions = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ];

  return (
    <ScreenContainer
      title="Búsqueda Avanzada de Evidencias"
      description="Encuentra evidencias usando filtros por criterio, responsable, fecha, estado y rol"
    >
      {/* Header con botones de acción */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SystemIcons.interface.filter size="sm" className="mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            onClick={clearAllFilters}
          >
            <SystemIcons.interface.refresh size="sm" className="mr-2" />
            Limpiar Filtros
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleExport('excel')}
            disabled={loading || filteredResults.length === 0}
          >
            <SystemIcons.modal.document size="sm" className="mr-2" />
            Excel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleExport('pdf')}
            disabled={loading || filteredResults.length === 0}
          >
            <SystemIcons.modal.document size="sm" className="mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SystemIcons.interface.filter size="md" />
            Filtros de Búsqueda
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Búsqueda general */}
            <div className="lg:col-span-3">
              <SearchInput
                placeholder="Buscar por descripción, criterio o responsable..."
                value={filters.busqueda_general || ''}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, busqueda_general: value }))
                }
              />
            </div>

            {/* Filtro por criterio */}
            <div>
              <CustomSelect
                label="Criterio"
                value={filters.criterio || ''}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, criterio: value || null }))
                }
                options={[
                  { value: '', label: 'Todos los criterios' },
                  ...mockCriteriaOptions
                ]}
                placeholder="Seleccione un criterio"
              />
            </div>

            {/* Filtro por responsable */}
            <div>
              <CustomSelect
                label="Responsable de Publicación"
                value={filters.responsable_id?.toString() || ''}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    responsable_id: value ? parseInt(value) : null
                  }))
                }
                options={[
                  { value: '', label: 'Todos los responsables' },
                  ...mockResponsibleOptions.map((opt) => ({
                    value: opt.value.toString(),
                    label: opt.label
                  }))
                ]}
                placeholder="Seleccione un responsable"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <CustomSelect
                label="Estado"
                value={filters.estado || 'todos'}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    estado: (value as typeof filters.estado) || 'todos'
                  }))
                }
                options={mockStatusOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label
                }))}
              />
            </div>

            {/* Filtro por rol */}
            <div>
              <CustomSelect
                label="Filtrar por Rol"
                value={filters.rol_id?.toString() || ''}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    rol_id: value ? parseInt(value) : null
                  }))
                }
                options={[
                  { value: '', label: 'Todos los roles' },
                  ...mockRoleOptions.map((opt) => ({
                    value: opt.value.toString(),
                    label: opt.label
                  }))
                ]}
                placeholder="Seleccione un rol"
              />
            </div>

            {/* Filtro por rango de fechas */}
            <div className="lg:col-span-2">
              <DateRangeFilter
                label="Fecha de Publicación"
                startDate={filters.fecha_publicacion_desde || null}
                endDate={filters.fecha_publicacion_hasta || null}
                onStartDateChange={(date) =>
                  setFilters((prev) => ({ ...prev, fecha_publicacion_desde: date }))
                }
                onEndDateChange={(date) =>
                  setFilters((prev) => ({ ...prev, fecha_publicacion_hasta: date }))
                }
              />
            </div>
          </div>

          {/* Botón de aplicar filtros */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={applyFiltersAndSort}
              disabled={loading}
              isLoading={loading}
            >
              <SystemIcons.interface.search size="sm" className="mr-2" />
              Buscar Evidencias
            </Button>
          </div>
        </div>
      )}

      {/* Panel de ordenamiento y estadísticas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Estadísticas */}
          <div className="text-sm text-gray-600">
            Mostrando{' '}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}-{Math.min(endIndex, totalResults)}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-gray-900">{totalResults}</span>{' '}
            resultado(s)
          </div>

          {/* Controles de ordenamiento */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <CustomSelect
              label="Campo"
              variant="default"
              value={sortField}
              onChange={(value) => setSortField(value as SortField)}
              options={sortFieldOptions}
              className="w-48"
            />
            <CustomSelect
              label="Dirección"
              variant="default"
              value={sortDirection}
              onChange={(value) => setSortDirection(value as SortDirection)}
              options={sortDirectionOptions}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <EvidenceSearchResultsTable
          results={paginatedResults}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            <SystemIcons.interface.chevronLeft size="sm" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                      page === currentPage
                        ? 'bg-azul-una text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Siguiente
            <SystemIcons.interface.chevronRight size="sm" />
          </Button>
        </div>
      )}
    </ScreenContainer>
  );
};

export default EvidenceSearchPage;
